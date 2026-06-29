import sys
import time
import tempfile
import os
import wave
import unicodedata

try:
    import sounddevice as sd
    import numpy as np
except ImportError:
    print("ERREUR : pip install sounddevice numpy")
    sys.exit(1)

try:
    import speech_recognition as sr
except ImportError:
    print("ERREUR : pip install SpeechRecognition")
    sys.exit(1)

try:
    from gtts import gTTS
except ImportError:
    print("ERREUR : pip install gtts")
    sys.exit(1)

import subprocess

speech1 = """ Monsieur le Ministre, aujourd'hui, l'intelligence artificielle apprend des centaines de langues du monde, mais très peu de langues africaines. Pourtant, une langue n'est pas seulement un moyen de communiquer ; c'est une culture, une identité et un patrimoine. Notre ambition est de créer une intelligence artificielle capable de comprendre et de parler nos langues africaines afin que chaque citoyen puisse accéder au numérique dans la langue qu'il maîtrise le mieux. Nous ne voulons pas seulement utiliser l'IA, nous voulons construire une IA qui nous ressemble."""

speech2 = """ Imaginez un agriculteur, une commerçante ou une mère de famille qui puisse dialoguer avec une intelligence artificielle dans sa langue maternelle, sans barrière linguistique. Ce projet vise à rendre les services numériques accessibles à tous, y compris à ceux qui ne parlent ni français ni anglais. Une IA qui parle nos langues, c'est une IA qui inclut toute la population. """

speech3 = """ L'Afrique ne doit pas être uniquement consommatrice des technologies de demain ; elle doit en être créatrice. En développant une intelligence artificielle qui comprend et parle les langues africaines, nous posons les bases d'une souveraineté numérique fondée sur nos cultures, nos langues et nos réalités. C'est un investissement dans notre patrimoine, dans notre jeunesse et dans l'avenir de notre continent. """


CORPUS = {
    speech1 : "",
    
    speech2 : "",
    
    speech3 : "",
    
    "comment allez-vous ?"  : "Mi fon gandji a ?",
    "comment tu vas ?"  : "à fon gandji a ?",
    "Moi aussi je vais bien !" : "Gne déssou moufon gandji ",
    
    "Il mange " : "Elo noudouwè",
    "Moi aussi" : "Gne déssou",
    "prends un taxi moto et viens là" : "do quai quai wa don",
    "Il me l'avait dit avant" : "Edo nou mi dayi",
    
    "Je suis déja de retour" : "MoulèKowa",
    "On remercie Dieu" : "Midokpè nou mawu",
    
    "alume la lampe" : "tà zogbain en ",
    
    
    "Viens s'il te plait" : "quin klain wa",
    "Je suis" : "Mou ni",
    "Ali pars est parti à l'ecole" : "Ali yi azomè",
    
    "Viens s'il te plait" : "quin klain wa",
    
    
}


def parler(texte, langue="fr"):
    try:
        tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        tmp.close()
        tts = gTTS(text=texte, lang=langue, slow=False)
        tts.save(tmp.name)
        subprocess.call(
            ["powershell", "-c",
             "Add-Type -AssemblyName presentationCore ; "
             "$mp = New-Object System.Windows.Media.MediaPlayer ; "
             "$mp.Open('" + tmp.name + "') ; "
             "$mp.Play() ; Start-Sleep 4"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        os.unlink(tmp.name)
    except Exception as e:
        print("  (lecture audio impossible : " + str(e) + ")")




def speackFon():
    for key, val in CORPUS.items():
        print("FR  : " + key)
        print("FON : " + val)
        parler(val, langue="fr")
        time.sleep(3)


def main():


        speackFon()
            





if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n  Termine. Log : asr_fon_log.txt\n")