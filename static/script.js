const output = document.getElementById("output");
let history = [];
let historyIndex = -1;

function displayAsciiBanner() {
  const image = `
                                   -+##%%#*=.
                               :*##############-
                             .##################*.
                            =#####################:
                           +#######################:
                          +#########################.
                         *###########################
                        *############################*
                       +##############################-
                      -###############################*.
                     .*################################+
                     +#######*+==---------==++*#########-
                    -###*=+*=--------:.:---------++*####+
                    +#%@@@@@#------:.....:------+@@@@@%##:
                     +##%%@@@*::.....:::.....::-@@@@%###+
                      .*##%%@@+...............:%@@%###+.
                    .-#@%####%%*:.::---:::...:#@%###%*.
                  =#@@@@@%*+###%%=..........=%%####%@@@%+.
               .*@@@@@@@@@@%==##%%%*-.....=#%####%@@@@@@@@#-
              +#%@@@@@@@@@@@@%:=##%@@%%%%%@%####%@@@@@@@@@%##-
            -####%@@@@@@@@@@@@%+:*##@@@@@%####%@@@@@@@@@@%####*.
           +######%@@@@@@@@@@@@@*:+##%@@%####%@@@@@@@@@@%#######.
          +#####-...:...........:.....................:.......-##:
         +######=:::::::::::::::::::::::::::::::::::::::::::::=###-
        =#######=:::::::::::::::::::::::::::::::::::::::::::::=####-
       =#######%=:::::::::::::::::::::::::::::::::::::::::::::=#####.
      -####%%%#%=:::::::::::::::::::::::::::::::::::::::::::::=#%###*.
     :###%%%%#%%=:::::::::::::::::::-=-:-=-:::::::::::::::::::=#%%###+
     #####%%%%%%=:::::::::::::::::::-=::::=:::::::::::::::::::=#%#####=
    +##%%%%%%%%%=:::::::::::::::::::--::::-:::::::::::::::::::=#%%%%###.
   -###%%%%%%%%%=:::::::::::::::::::-=-:-==:::::::::::::::::::=#%%%%%###
  .*#######%%%%%=:::::::::::::::::::::::::::::::::::::::::::::=#%#######=
  -############%=:::::::::::::::::::::::::::::::::::::::::::::=##%######*.
  +#############=:::::::::::::::::::::::::::::::::::::::::::::=##########-
  -#############=:::::::::::::::::::::::::::::::::::::::::::::=#########*
    :+##########=:::::::::::::::::::::::::::::::::::::::::::::=######*=     
         .-++***-:::::::::::::::::::::::::::::::::::::::::::::-+=-.
                .:::::::::::::::::::::::::::::::::::::::::::::.
`;

  const name = `
█▄░█ █ █▀█ ▄▀█ ░░█   █▀█ █▀█ █░█ █▀▄ █▀▀ █░░
█░▀█ █ █▀▄ █▀█ █▄█   █▀▀ █▄█ █▄█ █▄▀ ██▄ █▄▄

Software Engineer
`;

  const subtitle = "Type anything to get started!✨";

  const bannerElement1 = document.createElement("div");
  bannerElement1.className = "ascii-image";
  bannerElement1.textContent = image;

  const bannerElement2 = document.createElement("div");
  bannerElement2.className = "ascii-name";
  bannerElement2.textContent = name;

  const bannerElement3 = document.createElement("div");
  bannerElement3.className = "ascii-subtitle";
  bannerElement3.textContent = subtitle;

  output.appendChild(bannerElement1);
  output.appendChild(bannerElement2);
  output.appendChild(bannerElement3);
}

function appendLine(text) {
  const line = document.createElement("div");
  line.className = "line";
  line.textContent = text;
  output.appendChild(line);
  output.scrollTo({ top: output.scrollHeight, behavior: "smooth" });
}

async function typewriterEffect(text) {
  const block = document.createElement("div");
  block.className = "command-block";
  const prefix = "root@niraj> ";
  block.textContent = prefix;
  output.appendChild(block);

  const content = text.replace(/^root@niraj>\s*/, "");

  for (let i = 0; i < content.length; i++) {
    block.textContent += content[i];
    output.scrollTo({ top: output.scrollHeight, behavior: "smooth" });
    await new Promise((r) => setTimeout(r, 10));
  }

  block.innerHTML = block.innerHTML.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank">$1</a>'
  );
}

function handleSend() {
  const textarea = document.getElementById("chat-input");
  const userInput = textarea.value.trim();
  if (!userInput) return;

  const echoLine = document.createElement("div");
  echoLine.className = "line";
  echoLine.textContent = `localhost@user>> ${userInput}`;
  output.appendChild(echoLine);
  output.scrollTo({ top: output.scrollHeight });

  textarea.value = "";
  textarea.style.height = "44px";

  if (userInput.toLowerCase().includes("resume")) {
    appendLine("📄 Opening resume...");
    window.open("/resume", "_blank");
    return;
  }

  fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userInput }),
  })
    .then((res) => res.json())
    .then((data) => typewriterEffect(data.reply))
    .catch(() => appendLine("❌ Error fetching response"));
}

window.onload = () => {
  displayAsciiBanner();

  document.querySelectorAll(".cmd-tag").forEach((tag) => {
    tag.addEventListener("click", () => {
      const question = tag.dataset.question;
      const inputField = document.getElementById("chat-input");
      if (inputField) {
        inputField.value = question;
        inputField.focus();
        setTimeout(() => {
          inputField.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
      }
    });
  });

  const textarea = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const micBtn = document.getElementById("mic-btn");
  const imageBtn = document.getElementById("image-btn");
  const imageUpload = document.getElementById("image-upload");

  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
  });

  sendBtn.addEventListener("click", handleSend);

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  micBtn.addEventListener("click", () => {
    appendLine("🎤 Voice input coming soon...");
  });

  imageBtn.addEventListener("click", () => imageUpload.click());
  imageUpload.addEventListener("change", () => {
    const file = imageUpload.files[0];
    if (file) {
      appendLine(`🖼️ You selected: ${file.name}`);
      appendLine("🖼️ Image reader coming soon...");
    }
  });
};
