<p align=center><img height=250 src="https://github.com/midnqp/ai-chats-ai/assets/50658760/37f1ea59-eedd-4592-a1b4-46d2a8927027"></p>

This project is about making two AIs talk to each other. Talk with audio speech.

This project is built with:
- Llama2, served using [Ollama](https://github.com/jmorganca/ollama) with Docker, to generate text from prompt offline locally.
- [Coqui](https://github.com/coqui-ai/TTS), to generate speech from text offline locally.
- Llama2 API and gTTS to generate text and speech using Meta's and Google's APIs.

#### Usage

For quickstart, install [Node.js](https://nodejs.org/), [Python](https://www.python.org/downloads/), and run:
```bash
git clone https://github.com/midnqp/ai-chats-ai
cd ai-chats-ai
npm install
pip3 install -r requirements.txt
npm run trial
```
The trial run will use the Llama2 API and gTTS API to start a conversation. As these public APIs are rate-limited, the conversation will not be too long. However, it will be enjoyable ✨

To run locally, follow these steps:
- Install Ollama with Docker and run `$ ollama pull llama2-uncensored; ollama serve;`
- To check if it's running: `$ curl localhost:11434`
- Run `$ npm run start` and that's it 🚀

<p align=center>
  <img width=550 src="https://github.com/midnqp/ai-chats-ai/assets/50658760/6f60841c-5e39-4a33-a698-a7ae85d1fad2">
</p>
<p align=center>and</p>
<p align=center>
  <a href="https://clipchamp.com/watch/O8nmV1ASAaA"><img width=550 src="https://github.com/midnqp/ai-chats-ai/assets/50658760/ba67b5fa-4b4c-4448-b80e-62c660f1f842"></a>
</p>


#### Advanced

For advanced users, it is recommended to uplevel the Llama2 model by ensuring it uses all the physical cores of your device. So, if you device has 10 physical (not logical) cores, then create a [Modelfile](https://github.com/jmorganca/ollama/blob/main/docs/modelfile.md) append the following line:
```
PARAMETER num_thread 10
```
Then create a new model with new name.
