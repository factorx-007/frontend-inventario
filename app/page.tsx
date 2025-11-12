'use client';

import { useState } from "react";

export default function Home() {
  const [randomNumber, setRandomNumber] = useState(Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('Intenta adivinar el número entre 1 y 100!');
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleGuess = () => {
    const numGuess = parseInt(guess);
    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      setMessage('Por favor, ingresa un número válido entre 1 y 100.');
      return;
    }

    setAttempts(prev => prev + 1);

    if (numGuess === randomNumber) {
      setMessage(`¡Felicidades! Adivinaste el número ${randomNumber} en ${attempts + 1} intentos.`);
      setGameOver(true);
    } else if (numGuess < randomNumber) {
      setMessage('El número es más alto.');
    } else {
      setMessage('El número es más bajo.');
    }
    setGuess('');
  };

  const handleReset = () => {
    setRandomNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setMessage('Intenta adivinar el número entre 1 y 100!');
    setAttempts(0);
    setGameOver(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-900 shadow-lg rounded-lg max-w-md w-full">
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">Zona Friki del Almacenero</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">¡Bienvenido a la aventura del almacén!</p>

        <div className="mt-6 w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Adivina el Número</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
          
          {!gameOver ? (
            <div className="flex flex-col gap-4 items-center">
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                placeholder="Introduce tu número"
                min="1"
                max="100"
              />
              <button
                onClick={handleGuess}
                className="w-full px-5 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adivinar
              </button>
            </div>
          ) : (
            <button
              onClick={handleReset}
              className="w-full px-5 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition-colors"
            >
              Jugar de nuevo
            </button>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Intentos: {attempts}</p>
        </div>
      </main>
    </div>
  );
}
