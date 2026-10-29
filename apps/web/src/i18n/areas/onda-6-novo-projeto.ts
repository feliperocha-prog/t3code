const dictionary: Readonly<Record<string, string>> = {
  // Command palette + add-project list: start a project from scratch
  "New project from scratch": "Criar projeto do zero",
  "From scratch": "Do zero",
  "New folder with git, README and the Moon rules":
    "Pasta nova com git, README e as regras da Moon",
  // New project assistant
  "Creates a local folder with git, a README, a .gitignore that keeps .env out, and a CLAUDE.md with the Moon rules and the brand identity. Nothing goes to GitHub.":
    "Cria uma pasta local com git, README, um .gitignore que deixa o .env de fora e um CLAUDE.md com as regras da Moon e a identidade da marca. Nada vai pro GitHub.",
  "e.g. Stock dashboard": "ex.: Painel de estoque",
  "What is it for?": "Pra que serve?",
  "One or two sentences. They open the README and the CLAUDE.md.":
    "Uma ou duas frases. Elas abrem o README e o CLAUDE.md.",
  Brand: "Marca",
  Owner: "Dono",
  "Your name": "Seu nome",
  "Create in": "Criar em",
  "The folder name comes from the project name.": "O nome da pasta sai do nome do projeto.",
  "Create project": "Criar projeto",
  "Checking the folder…": "Conferindo a pasta…",
  "Could not open {folder}. Check that it exists.":
    "Não consegui abrir {folder}. Confira se a pasta existe.",
  "{folder} already has a folder named {name}.": "{folder} já tem uma pasta chamada {name}.",
  "Creating the project…": "Criando o projeto…",
  "Writing README, .gitignore and CLAUDE.md…": "Gravando README, .gitignore e CLAUDE.md…",
  "Starting git…": "Iniciando o git…",
  "Project {name} created": "Projeto {name} criado",
  "Project {name} created with gaps": "Projeto {name} criado, mas incompleto",
  "Could not finish: {steps}. Folder: {folder}": "Faltou: {steps}. Pasta: {folder}",
};

export default dictionary;
