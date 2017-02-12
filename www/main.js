const AUSTEN = `
It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.
  However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.
  “My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”
Mr. Bennet replied that he had not.
  “But it is,” returned she; “for Mrs. Long has just been here, and she told me all about it.”
Mr. Bennet made no answer.
  “Do you not want to know who has taken it?” cried his wife impatiently.
  “You want to tell me, and I have no objection to hearing it.”
This was invitation enough.
  “Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week.”
`

function main() {
  let meSpeakLoadPromise = loadMeSpeak()
  meSpeakLoadPromise.then(() => {
    let waveMaker = new WaveMaker()
    waveMaker.generateWavesForText({text: AUSTEN})
  })
}

function loadMeSpeak() {
  let meSpeakPromise = new Promise((resolve, reject) => {
    meSpeak.loadConfig('mespeak/mespeak_config.json')
    let cfgPromise = new Promise((resolveCfg, rejectCfg) => {
      function checkCfg () {
        if (meSpeak.isConfigLoaded()) {
          resolveCfg()
        } else {
          setTimeout(checkCfg, 200)
        }
      }
      checkCfg()
    })
    let voicePromise = new Promise((resolveVoice, rejectVoice) => {
      meSpeak.loadVoice('mespeak/voices/en/en-us.json', resolveVoice)
    })
    resolve(Promise.all([cfgPromise, voicePromise]))
  })
  return meSpeakPromise
}

class WaveMaker {
  constructor(kwargs) {
    kwargs = kwargs || {}
    let {container} = kwargs
    this.container = container || this.generateDefaultContainer()
    this.audioCtx = new AudioContext()
  }

  generateDefaultContainer() {
    let container = document.createElement('div')
    container.setAttribute('id', 'wave-maker')
    document.getElementById('main').appendChild(container)
    return container
  }

  generateWavesForText({text}) {
    let passages = this.extractPassagesFromText({text})
    // @TODO RESTORE!
    //for (let passage of passages) {
    for (let passage of passages.slice(0, 2)) {
      this.generateWaveRowForPassage({passage})
    }
  }

  extractPassagesFromText({text}) {
    let passages = text.split("\n")
    passages = passages.filter((passage) => {
      return (passage !== '')
    })
    return passages
  }

  generateWaveRowForPassage({passage}) {
    let waveRow = document.createElement('div')
    waveRow.setAttribute('class', 'row wave-row')
    this.container.appendChild(waveRow)

    let summaryContainer = document.createElement('div')
    summaryContainer.setAttribute('class', 'summary-container col-xs-4')
    waveRow.appendChild(summaryContainer)
    let summary = this.generateSummaryForPassage({passage})
    summaryContainer.appendChild(summary)

    let waveContainer = document.createElement('div')
    waveContainer.setAttribute('class', 'wave-container col-xs-8')
    waveRow.appendChild(waveContainer)
    let wave = this.generateWaveForPassage({passage})
    waveContainer.appendChild(wave)
  }

  generateSummaryForPassage({passage}) {
    let summary = document.createElement('div')
    summary.innerHTML = passage
    return summary
  }

  generateWaveForPassage({passage}) {
    let wave = document.createElement('div')
    this.loadAudioBufferForPassage({passage}).then((audioBuffer) => {
      let surfer = this.generateSurferForAudioBuffer({audioBuffer})
      wave.appendChild(surfer)
    })
    return wave
  }

  loadAudioBufferForPassage({passage}) {
    let audioBufferPromise = new Promise((resolve, reject) => {
      let rawData = meSpeak.speak(passage, {rawdata: 'arrayBuf'})
      this.audioCtx.decodeAudioData(rawData, (audioBuffer) => {
        resolve(audioBuffer)
      })
    })
    return audioBufferPromise
  }

  generateSurferForAudioBuffer({audioBuffer, container}) {
    container = container || this.generateSurferContainer()
    let surfer = WaveSurfer.create({
      audioContext: this.audioCtx,
      container,
      pixelRatio: 1,
      fillParent: false,
    })
    surfer.loadDecodedBuffer(audioBuffer)
    return container
  }

  generateSurferContainer() {
    let surfer = document.createElement('div')
    return surfer
  }
}

main()
