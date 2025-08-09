from flask import Flask, request
import time
import requests
import pygame
import threading

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

            play_wav(item['wav'])
def run_flask():
    app.run('0.0.0.0', 7000)    

if __name__ == "__main__":
    t = threading.Thread(target=run_flask)
    t.daemon = True
    t.start()
    worker_play_audio()