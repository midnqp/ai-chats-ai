<p align=center><img height=250 src="https://github.com/midnqp/ai-chats-ai/assets/50658760/37f1ea59-eedd-4592-a1b4-46d2a8927027"></p>

Make two AIs speak to each other on a given topic with a voice.

Built using Ollama, Llama3, Coqui-TTS. 

Both the text generation and audio generation is done locally. 

The voice server is written in Python. The text bubble server is written in Node.js. 

# Getting started
First install dependencies.

```
pyenv install 3.11
pyenv virtualenv 3.11 aichatsai
pyenv activate aichatsai
pip3 install -r ./requirements.txt
npm install
```

Then, run the following commands in three separate terminals. (I'm working to combine them into one command.)
```
pyenv shell aichatsai
python3 ./src/voice.py
```
```
pyenv shell aichatsai
python3 ./src/voice_player.py
```
```
npm run start -- --icebreaker 'How to be a better software developer?'
```

# Example
Unmute the video to listen. 

Note that there is a slight jitter in the audio. I do believe the jitter is due to excessive CPU workload - since I'm running both audio and text inferences on the CPU locally.

[](https://github.com/user-attachments/assets/1bc540ac-8ab9-4f2f-b67e-240cfbe127f2)

