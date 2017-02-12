function main() {
  let inputForm = document.getElementById('inputForm')
  let makeWavesBtn = document.getElementById('makeWavesBtn')
  let textInput = document.getElementById('textInput')
  let loadingMsgContainer = document.getElementById('loadingMsgContainer')
  let wavesRowContainer = document.getElementById('wavesRowContainer')
  let waveMaker = new WaveMaker({container: wavesRowContainer})

  // From file.
  textInput.value = SOUND_OF_WAVES_CHAPTER_1

  $(inputForm).fadeIn()

  loadMeSpeak().then(() => {
    makeWavesBtn.removeAttribute('disabled')
    makeWavesBtn.addEventListener('click', () => {
      let text = textInput.value
      $(inputForm).fadeOut().promise().then(() => {
        return $(loadingMsgContainer).fadeIn().promise()
      }).then(() => {
        return waveMaker.generateWavesForText({text: textInput.value})
      }).then(() => {
        return $(loadingMsgContainer).fadeOut().promise()
      }).then(() => {
        return $(wavesRowContainer).fadeIn()
      })
    })
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
    let wavePromises = []
    let passages = this.extractPassagesFromText({text})
    for (let passage of passages) {
      let wavePromise = this.generateWaveRowForPassage({passage})
      wavePromises.push(wavePromise)
    }
    return Promise.all(wavePromises)
  }

  extractPassagesFromText({text}) {
    let passages = text.split("\n")
    passages = passages.filter((passage) => {
      return (passage !== '')
    })
    return passages
  }

  generateWaveRowForPassage({passage}) {
    let wavePromise = new Promise((resolve, reject) => {
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
      resolve()
    })
    return wavePromise
  }

  generateSummaryForPassage({passage}) {
    let summary = document.createElement('div')
    let elidedText = document.createElement('div')
    elidedText.classList.add('truncate')
    elidedText.innerHTML = passage
    summary.appendChild(elidedText)
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
      cursorColor: 'rgba(0, 0, 0, .1)',
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
