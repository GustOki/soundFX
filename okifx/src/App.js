import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const Okifx = () => {
  const [nameInput, setNameInput] = useState('');
  const [availableNames, setAvailableNames] = useState([]);
  const [drawnNames, setDrawnNames] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentDraw, setCurrentDraw] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const audioRefs = useRef({});

  useEffect(() => {
    loadData();
    preloadAudios();
  }, []);

  useEffect(() => {
    if (availableNames.length > 0 || drawnNames.length > 0){
      saveData(availableNames, drawnNames);
    }
  }, [availableNames, drawnNames]);

  const preloadAudios = () => {
    const sounds = [
      'airhorn',
      'drumroll',
      'applause',
      'buzzer',
      'ding',
      'brasil',
      'tada',
      'success',
      'fail',
      'irra',
      'pare',
      'punch',
      'rapaz',
      'xii'
    ];

    sounds.forEach(sound => {
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.preload = 'audio';
      audio.load();
      audioRefs.current[sound] = audio;
    });
  };

  const loadData = () => {
    try {
      const savedAvailable = localStorage.getItem('available-names');
      const savedDrawn = localStorage.getItem('drawn-names');

      if (savedAvailable){
        setAvailableNames(JSON.parse(savedAvailable));
      }
      if (savedDrawn){
        setDrawnNames(JSON.parse(savedDrawn));
      }
    } catch(error) {
      console.log('erro ao carregar dados:', error);
    }
  };

  const saveData = (available, drawn) => {
    try {
      localStorage.setItem('available-names', JSON.stringify(available));
      localStorage.setItem('drawn-names', JSON.stringify(drawn));
    } catch(error){
      console.log('erro ao salvar:', error);
    }
  };

  const addName = () => {
    const trimmedName = nameInput.trim();
    
    if (!trimmedName) {
      setErrorMessage('Digite um nome!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    const nameExists = availableNames.some(
      name => name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (nameExists) {
      setErrorMessage(`"${trimmedName}" já está na lista!`);
      setTimeout(() => setErrorMessage(''), 3000);
      playSound('buzzer');
      return;
    }
    
    const newAvailable = [...availableNames, trimmedName];
    setAvailableNames(newAvailable);
    setNameInput('');
    playSound('ding');
  };

  const removeName = (index) => {
    const newAvailable = availableNames.filter((_, i) => i !== index);
    setAvailableNames(newAvailable);
  };

  const drawName = () => {
    if (availableNames.length === 0) return;

    setIsAnimating(true);

    const currentAvailable = [...availableNames];
    const drumrollAudio = audioRefs.current['drumroll'];
    
    if (drumrollAudio) {
      drumrollAudio.currentTime = 0;
      drumrollAudio.play().catch(error => {
        console.log('Erro ao tocar drumroll:', error);
      });

      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * currentAvailable.length);
        setCurrentDraw(currentAvailable[randomIndex]);
      }, 100);

      drumrollAudio.onended = () => {
        clearInterval(interval);

        const finalIndex = Math.floor(Math.random() * currentAvailable.length);
        const drawnName = currentAvailable[finalIndex];

        setCurrentDraw(drawnName);

        setAvailableNames(prevAvailable => 
          prevAvailable.filter(name => name !== drawnName)
        );
        
        setDrawnNames(prevDrawn => [...prevDrawn, drawnName]);
        setIsAnimating(false);
        setTimeout(() => {
          playSound('tada');
        }, 300);
      };
    }
  };

  const resetAll = () => {
    const allNames = [...availableNames, ...drawnNames];

    setAvailableNames(allNames);
    setDrawnNames([]);
    setCurrentDraw(null);

    localStorage.setItem('available-names', JSON.stringify(allNames));
    localStorage.setItem('drawn-names', JSON.stringify([]));
  };

  const playSound = (type) => {
    const audio = audioRefs.current[type];

    if (audio){
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.log('erro ao tocar áudio:', error);
      });
    }
  };

  return(
    <div className='container'>
      <div className='snowflakes' aria-hidden='true'>
        <div className='snowflake'>❅</div>
        <div className='snowflake'>❆</div>
        <div className='snowflake'>❅</div>
        <div className='snowflake'>❆</div>
        <div className='snowflake'>❅</div>
        <div className='snowflake'>❆</div>
        <div className='snowflake'>❅</div>
        <div className='snowflake'>❆</div>
      </div>
      
      <header className='header'>
        <div className='header-decoration'>
          <span className='star'>⭐</span>
          <h1 className='title'>🎄 SORTEIO AMIGO DA ONÇA 🎄</h1>
          <span className='star'>⭐</span>
        </div>
        <p className='subtitle'>ROOTS - Natal 2025</p>
      </header>

      <div className='content'>
        <div className='grid'>
          <section className='card'>
            <div className='input-group'>
              <input
                type='text'
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addName()}
                placeholder="Digite um nome"
                className='input'
              />

              <button onClick={addName} className='add-buton'>Adicionar</button>
            </div>

            <div className='section'>
              <div className='section-header'>
                <h3 className='section-title'>🎁 Participantes:</h3>
                <span className='badge'>{availableNames.length}</span>
              </div>

              <div className='list-box'>
                {availableNames.length === 0 ? (
                  <p className='empty-text'>Nenhum nome adicionado</p>
                ) : (
                  <div className='name-list'>
                    {availableNames.map((name, index) => (
                      <div key={index} className='name-tag'>
                        <span>{name}</span>
                        <button onClick={() => removeName(index)} className='remove-button'>x</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className='action-buttons'>
                <button 
                  onClick={drawName} 
                  disabled={availableNames.length === 0}
                  className={`button primary-button ${(availableNames.length === 0 || isAnimating) ? 'disabled' : '' }`}  
                >🎲 Sortear</button>

                <button onClick={resetAll} className='button secondary-button'>🔄 Reset</button>
            </div>

            <div className={`result-box ${isAnimating ? 'animating' : ''}`}>
                {currentDraw ? (
                  <div>
                    <p className='result-label'>⭐ Sorteado ⭐</p>
                    <p className='result-name'>{currentDraw}</p>
                  </div>
                ) : (
                  <p className='result-placeholder'>Aguardando sorteio...</p>
                )}
            </div>

            <div className='section'>
                <div className='section-header'>
                  <h3 className='section-title'>✅ Já sorteados:</h3>
                  <span className='badge'>{drawnNames.length}</span>
                </div>

                <div className='list-box'>
                  {drawnNames.length === 0 ? (
                    <p className='empty-text'>Nenhum nome sorteado</p>
                  ) : (
                    <div className='drawn-list'>
                      {drawnNames.map((name, index) => (
                        <div key={index} className='drawn-item'>
                          <span className='drawn-number'>{index + 1}.</span>
                          <span>{name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            </div>
          </section>

          <section className='card'>
            <h2 className='card-title'>🔊SoundFX</h2>

            <div className='sound-grid'>
              {[
                { name: '📯', type: 'airhorn' },
                { name: '🥁', type: 'drumroll' },
                { name: '👏', type: 'applause' },
                { name: '❌', type: 'buzzer' },
                { name: '🔔', type: 'ding' },
                { name: '🇧🇷', type: 'brasil' },
                { name: '🎉', type: 'tada' },
                { name: '✅', type: 'success' },
                { name: '👎', type: 'fail' },
                { name: '🤠', type: 'irra' },
                { name: '🤚', type: 'pare' },
                { name: '👊', type: 'punch' },
                { name: '😧', type: 'rapaz' },
                { name: '👀', type: 'xii' },
              ].map((sound) => (
                <button
                  key={sound.type}
                  onClick={() => playSound(sound.type)}
                  className='sound-button'
                >{sound.name}</button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Okifx;