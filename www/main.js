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
  let waveMaker = new WaveMaker()
  waveMaker.generateWavesForText({text: AUSTEN})
}

class WaveMaker {
  constructor(kwargs) {
    kwargs = kwargs || {}
    let {containerEl} = kwargs
    this.containerEl = containerEl || this.generateDefaultContainerEl()
  }

  generateDefaultContainerEl() {
    let containerEl = document.createElement('div')
    containerEl.setAttribute('id', 'wave-maker')
    document.body.appendChild(containerEl)
    return containerEl
  }

  generateWavesForText({text}) {
    let passages = this.extractPassagesFromText({text})
    for (let passage of passages) {
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
    let waveRowEl = document.createElement('div')
    waveRowEl.setAttribute('class', 'wave-row')
    this.containerEl.appendChild(waveRowEl)
    let summaryEl = this.generateSummaryElForPassage({passage})
    waveRowEl.appendChild(summaryEl)
    let waveEl = this.generateWaveElForPassage({passage})
    waveRowEl.appendChild(waveEl)
  }

  generateSummaryElForPassage({passage}) {
    let summaryEl = document.createElement('div')
    summaryEl.innerHTML = passage
    return summaryEl
  }

  generateWaveElForPassage({passage}) {
    let waveEl = document.createElement('div')
    waveEl.innerHTML = 'wave'
    return waveEl
  }
}

main()
