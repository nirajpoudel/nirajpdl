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

  const bannerElement1 = document.createElement("div");
  bannerElement1.className = "ascii-image";
  bannerElement1.textContent = image;

  const bannerElement2 = document.createElement("div");
  bannerElement2.className = "ascii-name";
  bannerElement2.textContent = name;

  output.appendChild(bannerElement1);
  output.appendChild(bannerElement2);
}


function createInputLine() {
  const inputLine = document.createElement("div");
  inputLine.className = "input-line";

  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.textContent = "localhost@user>> ";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "input-field";
  input.autocomplete = "off";
  input.focus();

  inputLine.appendChild(prompt);
  inputLine.appendChild(input);
  output.appendChild(inputLine);
  output.scrollTo({ top: output.scrollHeight, behavior: "smooth" });

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      const userInput = input.value.trim();
      if (!userInput) return;

      history.push(userInput);
      historyIndex = history.length;

      const echoLine = document.createElement("div");
      echoLine.className = "line";
      echoLine.textContent = `localhost@user>> ${userInput}`;
      output.replaceChild(echoLine, inputLine);

      const normalized = userInput.toLowerCase();
      const isResumeRequest =normalized.includes("resume") && (normalized.includes("open") || normalized.includes("view"));


      if (isResumeRequest) {
        try {
            appendLine("📄 Opening resume...");
            window.open("/resume", "_blank");  // 🚀 This must run immediately in response to user action
            createInputLine();
            return;

        } catch (err) {
          appendLine("❌ Failed to download resume.");
        }

        createInputLine();
        return;
      }

      try {
        const res = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userInput }),
        });

        const data = await res.json();
        await typewriterEffect(data.reply);
      } catch (err) {
        appendLine("❌ Error fetching response");
      }

      createInputLine();
    } else if (e.key === "ArrowUp") {
      if (historyIndex > 0) {
        historyIndex--;
        input.value = history[historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        input.value = history[historyIndex];
      } else {
        input.value = "";
      }
    }
  });
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

window.onload = () => {
  displayAsciiBanner();
  createInputLine();

  document.querySelectorAll('.cmd-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const question = tag.dataset.question;
      const inputField = document.querySelector('.input-field');
      if (inputField) {
        inputField.value = question;
        inputField.focus();
      }
    });
  });
};