'use strict';

(function() {
  const status = {
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

  const pomodoro = {};

  pomodoro.init = function() {
    workTimer.setNewWorkSession();
    workTimer.startWork();
    status.started = !status.started;
  };

  const workTimer = {
    init() {
      if (status.paused) {
        this.startWork();
      } else {
        this.pauseWork();
      }
      status.paused = !status.paused;
    },

    increaseInterval(minutes = 1) {
      status.workInterval += minutes;
      workTimer.setNewWorkSession();
    },

    decreaseInterval() {
      if (status.workInterval > 1) {
        status.workInterval--;
        workTimer.setNewWorkSession();
      }
    },

    getInterval() {
      return status.workInterval;
    },

    startWork() {
      const totalSeconds = status.workInterval * 60;

      status.workTimerId = setInterval(function () {
        status.workTimeLeft--;
        view.renderTimer(status.workTimeLeft, totalSeconds, 'WORK!');

        if (status.workTimeLeft === 0) {
          clearInterval(status.workTimerId);
          breakTimer.setNewBreakSession();
          breakTimer.startBreak();
          status.onBreak = true;
        }
      }, 1000);
    },

    pauseWork() {
      clearInterval(status.workTimerId);
    },

    setNewWorkSession() {
      status.workTimeLeft = status.workInterval * 60;
      view.renderIntervals(!status.onBreak ? status.workInterval : null);
    }
  };

  const breakTimer = {
    init() {
      if (status.paused) {
        this.startBreak();
      } else {
        this.pauseBreak();
      }
      status.paused = !status.paused;
    },

    increaseInterval(minutes = 1) {
      status.breakInterval += minutes;
      breakTimer.setNewBreakSession();
    },

    decreaseInterval() {
      if (status.breakInterval > 1) {
        status.breakInterval--;
        breakTimer.setNewBreakSession();
      }
    },

    getInterval() {
      return status.breakInterval;
    },

    startBreak() {
      const totalSeconds = status.breakInterval * 60;

      status.breakTimerId = setInterval(function () {
        status.breakTimeLeft--;
        view.renderTimer(status.breakTimeLeft, totalSeconds, 'BREAK!');

        if (status.breakTimeLeft === 0) {
          clearInterval(status.breakTimerId);
          workTimer.setNewWorkSession();
          workTimer.startWork();
          status.onBreak = false;
        }
      }, 1000);
    },

    pauseBreak() {
      clearInterval(status.breakTimerId);
    },

    setNewBreakSession() {
      status.breakTimeLeft = status.breakInterval * 60;
      view.renderIntervals(status.onBreak ? status.breakInterval : null);
    }
  };

  const view = {
    init() {
      const buttons = Array.from(document.querySelectorAll('button'));

      for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
          if (status.paused || !status.started) {
            const action = buttons[i].id;

            view.controls[action]();
          }
        });
      }

      document.querySelector('.clock').addEventListener('click', function () {
        if (status.started) {
          if (status.onBreak) {
            breakTimer.init();
          } else {
            workTimer.init();
          }
        } else {
          pomodoro.init();
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
      document.querySelector('.progress').style.background = 'linear-gradient(#333333 ' + percent + '%, ' + (status.onBreak ? '#dd1638' : '#99CC00') + ' 0%)';
    },

    renderIntervals(value) {
      const workInterval = workTimer.getInterval();
      const breakInterval = breakTimer.getInterval();

      document.querySelector('#break-duration').innerText = status.breakInterval;
      document.querySelector('#session-duration').innerText = status.workInterval;
      if (value) {
        document.querySelector('.timer').innerText = value;
      }
    }
  };


  view.controls = {
    'subtract-session': workTimer.decreaseInterval,
    'session-duration': function() {
        workTimer.increaseInterval(5);
      },
    'add-session': workTimer.increaseInterval,
    'subtract-break': breakTimer.decreaseInterval,
    'break-duration': function() {
      breakTimer.increaseInterval(5)
    },
    'add-break': breakTimer.increaseInterval
  };

  view.init();

})();
