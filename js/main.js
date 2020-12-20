'use strict';

(function () {
  const app = {
    backgroundMusic: false,
    started: false,
    paused: false,
    onBreak: false,
    workInterval: 25,
    breakInterval: 5,
    workTimeLeft: null,
    breakTimeLeft: null,
    workTimerId: null,
    breakTimerId: null
  };

  app.init = function () {
    workTimer.setNewSession();
    workTimer.start();
    app.started = !app.started;
  };

  app.youtubeMusic = {
    'baroque': 'https://www.youtube.com/embed/videoseries?list=PLcGkkXtask_clYSk4gXUAjfpquAo_lE9W&autoplay=1&loop=1',
    'coffeeshop': 'https://www.youtube.com/embed/videoseries?list=PLkmb1BBi8y92eep3jdYtbxHKvh-EHxSV4&index=1&autoplay=1&loop=1',
    'jazz': 'https://www.youtube.com/embed/videoseries?list=PLLv31kAgkBvaKNPxDFeJS6ILMEKFO-bdZ&autoplay=1&loop=1',
    'lofi': 'https://www.youtube.com/embed/videoseries?list=PLrSDK7cEP7LTtxogYMVhI_4YJ_Vak3bKp&autoplay=1&loop=1',
    'nature': 'https://www.youtube.com/embed/videoseries?list=PL6FB3Q57vUC8of2Ihv5YWDsER5PDMAL0y&autoplay=1&loop=1',
    'natureMusic': 'https://www.youtube.com/embed/videoseries?list=PLG4LQy3y02pKtdoW79LIEPSrA76WZSUz0&autoplay=1&loop=1'
  }

  // Work Timer
  const workTimer = {
    init() {
      if (app.paused) {
        workTimer.start();
      } else {
        workTimer.pause();
      }
      app.paused = !app.paused;
    },

    increase(minutes) {
      app.workInterval += minutes
      workTimer.setNewSession();
    },

    decrease(minutes) {
      if (minutes < app.workInterval) app.workInterval -= minutes;
      workTimer.setNewSession();
    },

    getInterval() {
      return app.workInterval;
    },

    start() {
      const breakAlert = new Audio("javascripts/sound/break.wav");

      const totalSeconds = app.workInterval * 60;
      // document.getElementById("youtube").src = 'https://www.youtube.com/embed/videoseries?list=PLcGkkXtask_clYSk4gXUAjfpquAo_lE9W&autoplay=1&loop=1';

      app.workTimerId = setInterval(function () {
        app.workTimeLeft--;
        view.renderTimer(app.workTimeLeft, totalSeconds, 'WORK!');

        if (app.workTimeLeft === 0) {
          clearInterval(app.workTimerId);
          breakTimer.setNewSession();
          breakTimer.start();
          breakAlert.play();
          app.onBreak = true;
        }
      }, 1000);
    },

    pause() {
      clearInterval(app.workTimerId);
    },

    setNewSession() {
      app.workTimeLeft = app.workInterval * 60;
      view.renderIntervals(!app.onBreak ? app.workInterval : null);
    }
  };

  // Break Timer
  const breakTimer = {
    init() {
      if (app.paused) {
        breakTimer.start();
      } else {
        breakTimer.pause();
      }
      app.paused = !app.paused;
    },

    increase(minutes) {
      app.breakInterval += minutes;
      breakTimer.setNewSession();
    },

    decrease(minutes) {
      if (minutes < app.breakInterval) app.breakInterval -= minutes;
      breakTimer.setNewSession();
    },

    getInterval() {
      return app.breakInterval;
    },

    start() {
      const totalSeconds = app.breakInterval * 60;
      const workAlert = new Audio("javascripts/sound/work.wav");

      app.breakTimerId = setInterval(function () {
        app.breakTimeLeft--;
        view.renderTimer(app.breakTimeLeft, totalSeconds, 'BREAK!');

        if (app.breakTimeLeft === 0) {
          clearInterval(app.breakTimerId);
          workTimer.setNewSession();
          workTimer.start();
          workAlert.play();
          app.onBreak = false;
        }
      }, 1000);
    },

    pause() {
      clearInterval(app.breakTimerId);
    },

    setNewSession() {
      app.breakTimeLeft = app.breakInterval * 60;
      view.renderIntervals(app.onBreak ? app.breakInterval : null);
    }
  };

  // Views
  const view = {
    init() {
      // Add listeners to interval buttons
      const buttons = Array.from(document.querySelectorAll('button'));

      for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
          if (app.paused || !app.started) {
            const action = buttons[i].dataset.type;
            const minutes = parseInt(buttons[i].dataset.minutes);

            // action object to control timer
            view.controls[action](minutes);
          }
        });
      }

      const musicOptions = document.querySelector('.music-options');
      const musicButtons = Array.from(musicOptions.querySelectorAll('button'));

      for (let i = 0; i < musicButtons.length; i++) {
        musicButtons[i].addEventListener('click', function () {
          const musicType = musicButtons[i].dataset.type;
          const youtubeLink = app.youtubeMusic[musicType];

          document.getElementById("youtube").src = youtubeLink;
        });
      }

      // Add listener to start/pause clock
      document.querySelector('.clock').addEventListener('click', function () {
        if (app.started) {
          if (app.onBreak) {
            breakTimer.init();
          } else {
            workTimer.init();
          }
        } else {
          app.init();
        }
      });
    },

    renderTimer(time, totalSeconds, sessionLabel) {
      const seconds = time % 60;
      const minutes = (time - seconds) / 60 % 60;
      const hours = Math.floor(time / 60 / 60);
      const percent = time / totalSeconds * 100;

      document.querySelector('.heading').innerText = sessionLabel;
      document.querySelector('.timer').innerText = '' + (hours === 0 ? '' : hours + ':') + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
      document.querySelector('.progress').style.background = 'linear-gradient(#333333 ' + percent + '%, ' + (app.onBreak ? '#dd1638' : '#99CC00') + ' 0%)';
    },

    renderIntervals(value) {
      const workInterval = workTimer.getInterval();
      const breakInterval = breakTimer.getInterval();

      document.querySelector('#break-duration').innerText = app.breakInterval;
      document.querySelector('#session-duration').innerText = app.workInterval;
      if (value) {
        document.querySelector('.timer').innerText = value;
      }
    }
  };


  view.controls = {
    'decrease-work': (minutes) => workTimer.decrease(minutes),
    'increase-work': (minutes) => workTimer.increase(minutes),
    'decrease-break': (minutes) => breakTimer.decrease(minutes),
    'increase-break': (minutes) => breakTimer.increase(minutes)
  };

  view.init();

})();
