function main() {
  let inputForm = document.getElementById('inputForm')
  let makeWavesBtn = document.getElementById('makeWavesBtn')
  let textInput = document.getElementById('textInput')
  let loadingMsgContainer = document.getElementById('loadingMsgContainer')
  let wavesRowContainer = document.getElementById('waveRowsContainer')
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
      let waveRow = document.createElement('tr')
      waveRow.setAttribute('class', 'wave-row')
      this.container.appendChild(waveRow)

      let summaryContainer = document.createElement('td')
      summaryContainer.setAttribute('class', 'summary-cell')
      waveRow.appendChild(summaryContainer)
      let summary = this.generateSummaryForPassage({passage})
      summaryContainer.appendChild(summary)

      let waveContainer = document.createElement('td')
      waveContainer.setAttribute('class', 'wave-cell')
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
    elidedText.classList.add('scroll-x')
    elidedText.innerHTML = passage
    summary.appendChild(elidedText)
    return summary
  }

  generateWaveForPassage({passage}) {
    let wave = document.createElement('div')
    this.loadAudioBufferForPassage({passage}).then((audioBuffer) => {
      let {surfer, controls, container} = this.generateSurferForAudioBuffer({
        audioBuffer
      })
      wave.appendChild(controls)
      wave.appendChild(container)
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
      height: 80,
      pixelRatio: 1,
      progressColor: '#555',
      waveColor: '#555',
      fillParent: false,
      cursorColor: 'rgba(0, 0, 0, .1)',
    })
    surfer.loadDecodedBuffer(audioBuffer)
    let controls = this.generateControlsForSurfer({surfer})
    return {surfer, controls, container}
  }

  generateSurferContainer() {
    let surfer = document.createElement('div')
    return surfer
  }

  generateControlsForSurfer({surfer}) {
    let controls = document.createElement('div')
    controls.classList.add('surfer-controls')
    let playBtn = document.createElement('button')
    controls.appendChild(playBtn)
    let playBtnLabel = document.createElement('span')
    playBtnLabel.classList.add('glyphicon', 'glyphicon-play')
    playBtn.appendChild(playBtnLabel)
    playBtn.addEventListener('click', () => {
      playBtnLabel.classList.toggle('glyphicon-play')
      playBtnLabel.classList.toggle('glyphicon-pause')
      surfer.playPause()
    })
    surfer.on('finish', () => {
      playBtnLabel.classList.remove('glyphicon-pause')
      playBtnLabel.classList.add('glyphicon-play')
    })
    return controls
  }
}

main()
