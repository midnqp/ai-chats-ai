from datetime import datetime
from io import BytesIO
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
pygame.mixer.init()

app = Flask(__name__)
tts = None
app.logger.disabled=True
logging.getLogger('werkzeug').disabled = True

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


def play_mp3(fp, type='mp3'):
    mp3 = pydub.AudioSegment.from_file(fp, type)
    mp3 = mp3.speedup(1.3)
    play(mp3)
    
def tts_gtts(data, accent):
    fp = BytesIO()
    g=gTTS(data, accent, lang_check=False)
    g.write_to_fp(fp)
    fp.seek(0)
    return fp

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

def play_wav(wav_filename):
    #sounddevice.play(wav, 22050)
    print('playing...', wav_filename)
    #sounddevice.play(wav, blocking=True)
    #sounddevice.wait()
    #fs, wav = wavfile.read(wav_filename)
    #sounddevice.play(wav, fs)
    #sounddevice.wait()
    #pygame.sndarray.make_sound(wav).play()
    sound = pygame.mixer.Sound(wav_filename)
    sound.play()
    pygame.time.delay(int(sound.get_length() * 1000))

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

            if engine == 'coqui-tts':
                wav = tts_llm(data, accent)
                result['wav'] = wav
                #print(wav)
                audios_made.append(result)
            elif engine == 'gtts':
                mp3 = tts_gtts(data, accent)
                result['wav'] = mp3
                audios_made.append(result)
    
    tts_worker_running = False
    
def worker_play_audio():
    color='green'
    global audios_made, play_worker_running
    if play_worker_running: return
    play_worker_running = True

    while True:
        if flag_kill_threads:
            break

        if len(audios_made) == 0:
            time.sleep(0.1)
            continue

        copy = audios_made.copy()
        audios_made = []

        backlog = len(copy)
        log(f"worker_play_audio: backlog is {backlog}", color)
        for item in copy:
            c = item.copy()
            del c['wav']
            try:
                requests.post('http://127.0.0.1:6000/sentence', json=c, timeout=1)
            except:
                pass

            if item['tts'] == 'coqui-tts':
                play_wav(item['wav'])
            elif item['tts'] == 'gtts':
                fp = item['wav']
                play_mp3(fp)
                fp.close()
    
    play_worker_running = False

def main():
    audioplayer = threading.Thread(target=worker_play_audio)
    audioplayer.start()
    audiomaker = threading.Thread(target=worker_make_audio)
    audiomaker.start()
    app.run('0.0.0.0', 5000)

if __name__ == "__main__":
    main()