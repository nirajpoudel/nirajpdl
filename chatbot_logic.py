import os
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Chroma as CommunityChroma
from langchain_chroma import Chroma as CoreChroma
from langchain_together import TogetherEmbeddings, ChatTogether
from langchain.text_splitter import CharacterTextSplitter

# Load environment variables
load_dotenv()
together_api = os.getenv("TOGETHER_API_KEY")
together_model = os.getenv("TOGETHER_MODEL")
together_embedding_model = os.getenv("TOGETHER_EMBEDDING")

# Directory setup
current_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(current_dir, "Source", "niraj.txt")
persistent_directory = os.path.join(current_dir, "db", "chroma_db")

# Initialize embeddings
embeddings = TogetherEmbeddings(model=together_embedding_model, together_api_key=together_api)

# Initialize or load vector store
if not os.path.exists(persistent_directory):
    print("Persistent directory doesn't exist. Initializing vector store...")

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"The file {file_path} does not exist. Please check the path.")

    loader = TextLoader(file_path, encoding='utf-8')
    documents = loader.load()

    text_splitter = CharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
    docs = text_splitter.split_documents(documents)

    print("Creating embeddings and vector store...")
    db = CommunityChroma.from_documents(docs, embeddings, persist_directory=persistent_directory)
else:
    print("Vector store already exists. Loading from disk...")
    db = CoreChroma(persist_directory=persistent_directory, embedding_function=embeddings)

# Retriever and LLM initialization
retriever = db.as_retriever(search_type="similarity", search_kwargs={"k": 3})
llm = ChatTogether(together_api_key=together_api, model=together_model)

# Function for answering queries
def get_chat_response(prompt):
    docs = retriever.invoke(prompt)
    context = "\n".join([doc.page_content for doc in docs])

    final_prompt = f"""You are a helpful assistant. Use the following context to answer the question.
You are really good about the information you have. Don't give false information to the user.
Always try to look carefully in the file that you are provided and go through each and every detail.
Behave like a human, not a robot.

If not found, say:
"Sorry, I couldn't find information about your questions. I only answer about Niraj."

Context:
{context}

Question: {prompt}
"""
    try:
        response = llm.invoke(final_prompt)
        return response.content
    except Exception as e:
        return f"❌ Error: {e}"

# # Example usage
# if __name__ == "__main__":
#     user_input = input("Ask me anything about Niraj: ")
#     print(get_chat_response(user_input))
