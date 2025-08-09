from datetime import datetime
from io import BytesIO
import subprocess
import threading
import time
from flask import Flask, request
import logging, os, signal
from gtts import gTTS
import pydub
from pydub.playback import play 
from TTS.api import TTS
import sounddevice
import requests, termcolor
from scipy.io import wavfile
import pygame
import tempfile

app = Flask(__name__)
tts = None
app.logger.disabled=True
logging.getLogger('werkzeug').disabled = True
logging.disable(logging.CRITICAL)

sentences_received=[]
audios_made = []
flag_kill_threads = False
tts_worker_running = False
play_worker_running = False

def log(text, color):
    print(termcolor.colored(text, color), flush=True)

@app.route('/sentence', methods=['POST'])
def api_words():
    color='yellow'
    global sentences_received

    data = request.get_data(as_text=True) or '.'
    accent = request.args.get('accent')
    tts_engine = request.args.get('tts')

    sentence = {
        "data":data ,
        "accent":accent,
        "tts":tts_engine
    }
    sentences_received.append(sentence)
    log(f"post /sentence | {sentence}", color)

    return ''

@app.route('/exit', methods=['POST'])
def api_exit():
    global flag_kill_threads
    flag_kill_threads=True
    os.kill(os.getpid(), signal.SIGINT)
    return ''


def tts_llm(data, accent):
    global tts
    speaker = 'p251' if accent == 'us' else 'p305'
    if tts is None:
        tts = TTS("tts_models/en/vctk/vits", progress_bar=False).to('cpu')
        

    #wav = tts.tts(text=data, speaker=speaker)
    #wav_filename = "temp"+datetime.now().isoformat()+".wav"
    wav_filename = tempfile.mktemp(suffix='.wav')
    tts.tts_to_file(text=data, speaker=speaker, file_path=wav_filename)
    #wav = []
    return wav_filename


def worker_make_audio():
    color='blue'
    global sentences_received, audios_made, tts_worker_running
    if tts_worker_running: return
    tts_worker_running = True
    
    while True:
        if flag_kill_threads: break

        if len(sentences_received) == 0:
            time.sleep(0.1)
            continue

        copy = sentences_received.copy()
        sentences_received = []

        backlog = len(copy)
        log( f"worker_make_audio: backlog is {backlog}", color)
        for item in copy:
            data = item['data']
            accent = item['accent']
            engine = item['tts']
            result = item.copy()

            wav_filename = tts_llm(data, accent)
            sample_rate, audio_data = wavfile.read(wav_filename)
            audio_duration = len(audio_data) / sample_rate

            #subprocess.Popen(['python', './voice_player2.py', wav_filename])
            #print('subprocesss ran')
            result['wav'] = wav_filename
            try:
                requests.post('http://127.0.0.1:7000/play', json=result)
            except:
                pass

    tts_worker_running = False
    
def main():
    #audioplayer = threading.Thread(target=worker_play_audio)
    #audioplayer.start()
    audiomaker = threading.Thread(target=worker_make_audio)
    audiomaker.start()
    app.run('0.0.0.0', 5000)

if __name__ == "__main__":
    main()