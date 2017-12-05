import fileUtils from './utils/file.js';
import GlApp from './gl/gl-app.js';
import appEvent from './utils/app-event.js';

class App {
    constructor() {
        this.uiElems = {
            imageInput: document.getElementById('app-image-input'),
            canvas: document.getElementById('app-canvas'),
            textCanvas: document.getElementById('text-canvas')
        };
        this._appMode = 'pan';
        this.glApp = new GlApp(this.uiElems.canvas, this.uiElems.textCanvas);
        this._handleUiEvents();
        this._handleMouseMoveEvents();
        this._handleMouseZoomEvents();
        this._handleMouseClickEvents();
        this._handleResizeEvents();
        this._initAppMode();
    }

    _downloadJson() {
        let points = this.glApp.getPoints();
        fileUtils.downloadJson({points: points}, 'points');
    }

    _initAppMode() {
        [].forEach.call(document.querySelectorAll('.app-mode-input'), function (inputElem) {
            if (inputElem.checked) {
                this._appMode = inputElem.value;
                document.body.className = `mode-${this._appMode}`;
                appEvent.dispatch('mode-change', {mode: this._appMode});
            }
        }, this);
      
      	this._handleUiButtons();
    }

    _handleUiEvents() {
        this.uiElems.imageInput.addEventListener('change', this._handleImageSelection.bind(this));
    }

    _handleResizeEvents() {
        window.addEventListener('resize', function (evt) {
            appEvent.dispatch('canvas-resize', {});
        });
    }

    _handleUiButtons() {
        document.getElementById('zoom-in').addEventListener('click', function () {
            appEvent.dispatch('zoom-image', {
                delta: 1,
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
            });
        });
      	document.getElementById('zoom-out').addEventListener('click', function () {
            appEvent.dispatch('zoom-image', {
                delta: -1,
              	x: window.innerWidth / 2,
                y: window.innerHeight / 2,
            });
        });
      	document.getElementById('zoom-reset').addEventListener('click', function () {
            appEvent.dispatch('transformation-reset', {});
        });
      
      	document.getElementById('gamma-filter').addEventListener('change', function () {
          	let value = this.value;
          	document.getElementById('gamma-value').innerHTML = value;
          	appEvent.dispatch('gamma-filter', {
                value: value
            });
        });
    }

    _handleMouseClickEvents() {
        const self = this;
        document.body.addEventListener('click', function (evt) {

            if (evt.target && evt.target.id == 'app-download-points') {
                self._downloadJson();
            }
            // listen only to events on our canvas, ignore other elems
            if (!evt.target || !~ evt.target.className.indexOf("app-canvas")) {
                return;
            }
            evt.preventDefault();
            switch (self._appMode) {
                case 'add':
                    {
                        appEvent.dispatch('add-point', {
                            x: evt.clientX,
                            y: evt.clientY
                        });
                        break;
                    }
                case 'remove':
                    {
                        appEvent.dispatch('remove-point', {
                            x: evt.clientX,
                            y: evt.clientY
                        });
                        break;
                    }
                case 'pan':
                case 'move':
                default:
                    return;
            }
        });

        document.body.addEventListener('change', function (evt) {
            // listen only to events on our canvas, ignore other elems
            if (!evt.target || !~ evt.target.className.indexOf("app-mode-input")) {
                return;
            }
            self._appMode = evt.target.value;
            document.body.className = `mode-${self._appMode}`;
            appEvent.dispatch('mode-change', {mode: self._appMode});
        });
    }

    _handleMouseZoomEvents() {
        document.body.addEventListener('wheel', function (evt) {
            // listen only to events on our canvas, ignore other elems
            if (!evt.target || !~ evt.target.className.indexOf("app-canvas")) {
                return;
            }
            evt.preventDefault();
            let deltaY = evt.deltaY;
            appEvent.dispatch('zoom-image', {
                delta: deltaY > 0 ? -1 : 1,
                x: evt.clientX,
                y: evt.clientY
            });
        });
    }

    _handleMouseMoveEvents() {
        // start coords to count delta X and delta Y
        let startX;
        let startY;
        let self = this;

        // flag - shows whether translation is undergoing now or not
        let isMoving = false;
        document.body.addEventListener('mousedown', function (evt) {
            // listen only to events on our canvas, ignore other elems
            if (!evt.target || !~ evt.target.className.indexOf("app-canvas")) {
                return;
            }
            switch (self._appMode) {
                case 'pan':
                    {
                        evt.preventDefault();
                        startX = evt.clientX;
                        startY = evt.clientY;
                        isMoving = true;
                        document.body.classList.add('moving');
                        break;
                    }
                case 'move':
                    {
                        evt.preventDefault();
                        startX = evt.clientX;
                        startY = evt.clientY;
                        isMoving = true;
                        document.body.classList.add('moving');
                    }
            }

        });

        document.body.addEventListener('mousemove', function (evt) {
            // listen only to events on our canvas, ignore other elems
            if (!evt.target || !~ evt.target.className.indexOf("app-canvas")) {
                return;
            }

            switch (self._appMode) {
                case 'pan':
                    {
                        evt.preventDefault();
                        let deltaX = evt.clientX - startX;
                        let deltaY = evt.clientY - startY;

                        if (isMoving) {
                            appEvent.dispatch('move-image', {
                                x: deltaX,
                                y: deltaY
                            });

                            startX = evt.clientX;
                            startY = evt.clientY;
                        }
                        break;
                    }
                case 'remove':
                    {
                        evt.preventDefault();
                        appEvent.dispatch('hover-image--delete', {
                            x: evt.clientX,
                            y: evt.clientY
                        });
                    }

                case 'move':
                    {
                        evt.preventDefault();
                        appEvent.dispatch('hover-image--move', {
                            x: evt.clientX,
                            y: evt.clientY,
                            isMoving: isMoving
                        });
                    }
                case 'add':
                default:
                    return;
            }
            // prevent default mousemove behaviour: to prevent text selection in control elems

        });

        document.body.addEventListener('mouseup', function (evt) {
            // listen only to events on our canvas, ignore other elems if (!evt.target || evt.target.id !=
            // "app-canvas") {     return; } evt.preventDefault();
            document.body.classList.remove('moving');
            isMoving = false;
        });
    }

    _handleImageSelection(evt) {
        if (!(evt && evt.target && evt.target.files)) {
            throw new Error('Image file is required but not selected');
        }

        let file = evt.target.files[0];
        let imageUrl = fileUtils.getUrlForInputFile(file);
        appEvent.dispatch('image-change', {url: imageUrl});
    }
}

document.addEventListener('DOMContentLoaded', function () {
    new App();
});