<!--p align=center><img height=250 src="https://github.com/midnqp/ai-chats-ai/assets/50658760/ba7a0310-ba75-479c-9560-010e96e9654a"></p-->

<p align=center><img height=250 src="https://github.com/midnqp/ai-chats-ai/assets/50658760/37f1ea59-eedd-4592-a1b4-46d2a8927027"></p>

This project is about making two AIs talk to each other. Talk with audio speech.

This project is built with:
- Llama2, served using [Ollama](https://github.com/jmorganca/ollama) with Docker, to generate text from prompt offline locally.
- [Coqui](https://github.com/coqui-ai/TTS), to generate speech from text offline locally.
- Llama2 API and gTTS to generate text and speech using Meta's and Google's APIs.

#### Usage

To get started, install [Node.js](https://nodejs.org/) and run:
```bash
$ npm i -g ts-node
$ ts-node-esm text.ts --trial
```
The option `--trial` will use the Llama2 API and gTTS API to start a conversation. As these public APIs are rate-limited, the conversation will not last beyond a few minutes.

To run locally, follow these steps:
- Install Ollama with Docker and run `$ ollama pull llama2-uncensored; ollama serve;` To check if it's running: `$ curl localhost:11434`
- Run `$ ts-node-esm text.ts`

#### Advanced

For advanced users, it is recommended to uplevel the Llama2 model by ensuring it uses all the physical cores of your device. So, if you device has 10 physical (not logical) cores, then create a [Modelfile](https://github.com/jmorganca/ollama/blob/main/docs/modelfile.md) add the following line:
```
PARAMETER num_thread 10
```
Then create a new model with new name.

<!--p align=center><img width=350 src="https://github.com/midnqp/ai-chats-ai/assets/50658760/2004451d-1797-4dda-a8de-484c26ec68a9"></p-->
<!--p align=center><img src="https://github.com/midnqp/ai-chats-ai/assets/50658760/7b2f2ab6-62d8-4a06-88c4-3acbe0d86b27"></p-->
