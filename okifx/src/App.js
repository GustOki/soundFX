import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const Okifx = () => {
  const [nameInput, setNameInput] = useState('');
  const [availableNames, setAvailableNames] = useState([]);
  const [drawnNames, setDrawnNames] = useState([]);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const audio = useRef(null);

  useEffect(() => {
    audio.current = new (window.AudioContext || window.webkitAudioContext)();
    loadData();
  }, []);

  const loadData = async() => {
    try {
      const availableResult = await window.storage.get('available-names');
      const drawnResult = await window.storage.get('drawn-names');

      if (availableResult?.value){
        setAvailableNames(JSON.parse(availableResult.value));
      }
      if (drawnResult?.value){
        setDrawnNames(JSON.parse(drawnResult.value));
      }
    } catch(error) {
      console.log('primeira vez usando o app:', error);
    }
  };

  const saveData = async (available, drawn) => {
    try {
      await window.storage.set('available-names', JSON.stringify(available));
      await window.storage.set('drawn-names', JSON.stringify(drawn));
    } catch(error){
      console.log('erro ao salvar:', error);
    }
  };

  const addName = () => {
    if (nameInput.trim()){
      const newAvailable = [...availableNames, nameInput.trim()];
      setAvailableNames(newAvailable);
      saveData(newAvailable, drawnNames);
      setNameInput('');
    }
  };

  const removeName = (index) => {
    const newAvailable = availableNames.filter((_, i) => i !== index);
    setAvailableNames(newAvailable);
    saveData(newAvailable, drawnNames);
  };

  const drawName = () => {
    if (availableNames.length === 0) return;

    setIsAnimating(true);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableNames.length);
      setCurrentDraw(availableNames[randomIndex]);
      counter++;

      if (counter > 15) {
        clearInterval(interval);

        const finalIndex = Math.floor(Math.random() * availableNames.length);
        const drawnName = availableNames[finalIndex];

        setCurrentDraw(drawnName);

        const newAvailable = availableNames.filter((_, i) => i !== finalIndex);
        const newDrawn = [...drawnNames, drawnName];

        setAvailableNames(newAvailable);
        setDrawnNames(newDrawn);
        saveData(newAvailable, newDrawn);

        setIsAnimating(false);
        playSound('success');
      }
    }, 100);
  };

  const resetAll = async() => {
    const allNames = [...availableNames, ...drawnNames];

    setAvailableNames(allNames);
    setDrawnNames([]);
    setCurrentDraw(null);
    saveData(allNames, []);
  };

  const playSound = (type) => {
    const ctx = audio.current;

    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch(type) {
      case 'success':
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;

      case 'airhorn':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime = 0.05);
        break;

      case 'drumroll':
        for (let i = 0; i < 20; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'square';
          osc.frequency.setValueAtTime(100, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.05);
          
          osc.start(ctx.currentTime + i * 0.05);
          osc.stop(ctx.currentTime + i * 0.05 + 0.05);
        }
        break;
      
      case 'applause':
        for (let i = 0; i < 100; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'white';
          osc.frequency.setValueAtTime(Math.random() * 1000 + 500, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime + Math.random() * 1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + Math.random() * 1 + 0.1);
          
          osc.start(ctx.currentTime + Math.random() * 1);
          osc.stop(ctx.currentTime + Math.random() * 1 + 0.1);
        }
        break;

      case 'buzzer':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
        break;
      
      case 'ding':
        oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      
      case 'whistle':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(2000, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      
      case 'tada':
        [523, 659, 784, 1047].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
          
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
        break;
    }
  };

  return(
    <div className='container'>
      <header className='header'>
        <h1 className='title'>SORTEIO AMIGO DA ONÇA</h1>
      </header>

      <div className='content'>
        <div className='grid'>
          <section className='card'>
            <h2 className='card-title'>Sorteio</h2>

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
                <h3 className='section-title'>Disponíveis</h3>
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

            <div className={`result-box ${isAnimating ? 'animating' : ''}`}>
                {currentDraw ? (
                  <div>
                    <p className='result-label'>Sorteando:</p>
                    <p className='result-name'>{currentDraw}</p>
                  </div>
                ) : (
                  <p className='result-placeholder'>Aguardando sorteio</p>
                )}
            </div>

            <div className='action-buttons'>
                <button 
                  onClick={drawName} 
                  disabled={availableNames.length === 0}
                  className={`button primary-button ${(availableNames.length === 0 || isAnimating) ? 'disabled' : '' }`}  
                >Sortear</button>

                <button onClick={resetAll} className='button secondary-button'>Reset</button>
            </div>

            <div className='section'>
                <div className='section-header'>
                  <h3 className='section-title'>Já sorteados:</h3>
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
            <h2 className='card-title'>SoundFX</h2>

            <div className='sound-grid'>
              {[
                { name: 'Corneta', type: 'airhorn' },
                { name: 'Tambor', type: 'drumroll' },
                { name: 'Aplausos', type: 'applause' },
                { name: 'Buzina', type: 'buzzer' },
                { name: 'Ding', type: 'ding' },
                { name: 'Whistle', type: 'whistle' },
                { name: 'Ta-da', type: 'tada' },
                { name: 'Sucesso', type: 'success' },
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