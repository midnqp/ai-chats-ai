import sys
import pygame

def play_wav(wav_filename):
    print('playing audio:', wav_filename)
    sound = pygame.mixer.Sound(wav_filename)
    sound.play()
    pygame.time.delay(int(sound.get_length() * 1000))

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python voice_player2.py <wav_filename>")
        sys.exit(1)

    wav_filename = sys.argv[1]
    pygame.mixer.init()
    play_wav(wav_filename)