import os
from flask import Flask, request
import time , sys
import requests
import pygame
import threading
import subprocess
from scipy.io import wavfile

app = Flask(__name__)
pygame.mixer.init()
audios_made = []

@app.route('/play', methods=['POST'])
def api_play_audio():
    print('received new')
    audios_made.append(request.json)
    return ''

def play_wav(wav_filename):
    print('playing audio:', wav_filename)
    sound = pygame.mixer.Sound(wav_filename)
    sound.play()
    pygame.time.delay(int(sound.get_length() * 1000))

def launch_independent(command):
    kwargs = {}
    if sys.platform == "win32":
        kwargs.update({
            "creationflags": (
                subprocess.CREATE_NEW_PROCESS_GROUP |
                subprocess.DETACHED_PROCESS
            ),
            "shell": True
        })
    else:
        kwargs.update({
            "start_new_session": True,
            "stdin": subprocess.DEVNULL,
            "stdout": subprocess.DEVNULL,
            "stderr": subprocess.DEVNULL
        })
    
    return subprocess.Popen(command, **kwargs)

def worker_play_audio():
    global audios_made

    while True:
        print('while-true')
        if len(audios_made) == 0:
            time.sleep(0.1)
            continue

        copy = audios_made.copy()
        audios_made = []

        for item in copy:
            c = item.copy()
            del c['wav']
            try:
                requests.post('http://127.0.0.1:6000/sentence', json=c)
            except:
                pass

            curr_filename = os.path.dirname(os.path.abspath(__file__))+'/voice_player2.py'
            #args = ['nohup', 'python', , item['wav'], '&']
            args = ['python', curr_filename, item['wav']]
            print('args', args)
            #subprocess.Popen(args, shell=True)
            launch_independent(args)
            sample_rate, audio_data = wavfile.read(item['wav'])
            audio_duration = len(audio_data) / sample_rate
            time.sleep(audio_duration + 0.1)
            print('sleep done')
            #play_wav(item['wav'])

def run_flask():
    app.run('0.0.0.0', 7000)    

if __name__ == "__main__":
    #t = threading.Thread(target=run_flask)
    t = threading.Thread(target=worker_play_audio)
    t.start()

    #worker_play_audio()
    run_flask()