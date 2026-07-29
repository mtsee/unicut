(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MediaInfo = {}));
})(this, (function (exports) { 'use strict';

  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : e[r] = t, e;
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o,
      r,
      i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
      var s = Object.getOwnPropertySymbols(e);
      for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
      if (e.includes(n)) continue;
      t[n] = r[n];
    }
    return t;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }

  function isError(error) {
    return error !== null && typeof error === 'object' && Object.prototype.hasOwnProperty.call(error, 'message');
  }
  function unknownToError(error) {
    if (isError(error)) {
      return error;
    }
    return new Error(typeof error === 'string' ? error : 'Unknown error');
  }

  // DO NOT EDIT! File generated using `generate-types` script.

  const INT_FIELDS = ['Active_Height', 'Active_Width', 'AudioCount', 'Audio_Channels_Total', 'BitDepth_Detected', 'BitDepth', 'BitDepth_Stored', 'Channels', 'Channels_Original', 'Chapters_Pos_Begin', 'Chapters_Pos_End', 'Comic_Position_Total', 'Count', 'DataSize', 'ElementCount', 'EPG_Positions_Begin', 'EPG_Positions_End', 'FirstPacketOrder', 'FooterSize', 'Format_Settings_GMC', 'Format_Settings_RefFrames', 'Format_Settings_SliceCount', 'FrameCount', 'FrameRate_Den', 'FrameRate_Num', 'GeneralCount', 'HeaderSize', 'Height_CleanAperture', 'Height', 'Height_Offset', 'Height_Original', 'ImageCount', 'Lines_MaxCharacterCount', 'Lines_MaxCountPerEvent', 'Matrix_Channels', 'MenuCount', 'OtherCount', 'Part_Position', 'Part_Position_Total', 'Played_Count', 'Reel_Position', 'Reel_Position_Total', 'Resolution', 'Sampled_Height', 'Sampled_Width', 'SamplingCount', 'Season_Position', 'Season_Position_Total', 'Source_FrameCount', 'Source_SamplingCount', 'Source_StreamSize_Encoded', 'Source_StreamSize', 'Status', 'Stored_Height', 'Stored_Width', 'StreamCount', 'StreamKindID', 'StreamKindPos', 'StreamSize_Demuxed', 'StreamSize_Encoded', 'StreamSize', 'TextCount', 'Track_Position', 'Track_Position_Total', 'Video0_Delay', 'VideoCount', 'Width_CleanAperture', 'Width', 'Width_Offset', 'Width_Original'];
  const FLOAT_FIELDS = ['Active_DisplayAspectRatio', 'BitRate_Encoded', 'BitRate_Maximum', 'BitRate_Minimum', 'BitRate', 'BitRate_Nominal', 'Bits-Pixel_Frame', 'BitsPixel_Frame', 'Compression_Ratio', 'Delay', 'Delay_Original', 'DisplayAspectRatio_CleanAperture', 'DisplayAspectRatio', 'DisplayAspectRatio_Original', 'Duration_End_Command', 'Duration_End', 'Duration_FirstFrame', 'Duration_LastFrame', 'Duration', 'Duration_Start2End', 'Duration_Start_Command', 'Duration_Start', 'Events_MinDuration', 'FrameRate_Maximum', 'FrameRate_Minimum', 'FrameRate', 'FrameRate_Nominal', 'FrameRate_Original_Den', 'FrameRate_Original', 'FrameRate_Original_Num', 'FrameRate_Real', 'Interleave_Duration', 'Interleave_Preload', 'Interleave_VideoFrames', 'OverallBitRate_Maximum', 'OverallBitRate_Minimum', 'OverallBitRate', 'OverallBitRate_Nominal', 'PixelAspectRatio_CleanAperture', 'PixelAspectRatio', 'PixelAspectRatio_Original', 'SamplesPerFrame', 'SamplingRate', 'Source_Duration_FirstFrame', 'Source_Duration_LastFrame', 'Source_Duration', 'TimeStamp_FirstFrame', 'Video_Delay'];

  const MAX_UINT32_PLUS_ONE = 2 ** 32;
  const DEFAULT_OPTIONS = {
    coverData: false,
    chunkSize: 256 * 1024,
    format: 'object',
    full: false
  };
  /**
   * Wrapper for the MediaInfoLib WASM module.
   *
   * This class should not be instantiated directly. Use the {@link mediaInfoFactory} function
   * to create instances of `MediaInfo`.
   *
   * @typeParam TFormat - The format type, defaults to `object`.
   */
  class MediaInfo {
    /** @group General Use */

    /**
     * The constructor should not be called directly, instead use {@link mediaInfoFactory}.
     *
     * @hidden
     * @param mediainfoModule WASM module
     * @param options User options
     */
    constructor(mediainfoModule, options) {
      this.mediainfoModule = mediainfoModule;
      this.options = options;

      // Instantiate
      this.mediainfoModuleInstance = new mediainfoModule.MediaInfo(options.format === 'object' ? 'JSON' : options.format, options.coverData, options.full);
    }

    /**
     * Convenience method for analyzing a buffer chunk by chunk.
     *
     * @param size Return total buffer size in bytes.
     * @param readChunk Read chunk of data and return an {@link Uint8Array}.
     * @group General Use
     */

    /**
     * Convenience method for analyzing a buffer chunk by chunk.
     *
     * @param size Return total buffer size in bytes.
     * @param readChunk Read chunk of data and return an {@link Uint8Array}.
     * @param callback Function that is called once the processing is done
     * @group General Use
     */

    analyzeData(size, readChunk, callback) {
      // Support promise signature
      if (callback === undefined) {
        return new Promise((resolve, reject) => {
          const resultCb = (result, error) => {
            if (error || !result) {
              reject(unknownToError(error));
            } else {
              resolve(result);
            }
          };
          this.analyzeData(size, readChunk, resultCb);
        });
      }
      const finalize = () => {
        this.openBufferFinalize();
        const result = this.inform();
        if (this.options.format === 'object') {
          callback(this.parseResultJson(result));
        } else {
          callback(result);
        }
      };
      let offset = 0;
      const runReadDataLoop = fileSize => {
        const readNextChunk = data => {
          if (continueBuffer(data)) {
            getChunk();
          } else {
            finalize();
          }
        };
        const getChunk = () => {
          let dataValue;
          try {
            const safeSize = Math.min(this.options.chunkSize, fileSize - offset);
            dataValue = readChunk(safeSize, offset);
          } catch (error) {
            callback('', unknownToError(error));
            return;
          }
          if (dataValue instanceof Promise) {
            dataValue.then(readNextChunk).catch(error => {
              callback('', unknownToError(error));
            });
          } else {
            readNextChunk(dataValue);
          }
        };
        const continueBuffer = data => {
          if (data.length === 0 || this.openBufferContinue(data, data.length)) {
            return false;
          }
          const seekTo = this.openBufferContinueGotoGet();
          if (seekTo === -1) {
            offset += data.length;
          } else {
            offset = seekTo;
            this.openBufferInit(fileSize, seekTo);
          }
          return true;
        };
        this.openBufferInit(fileSize, offset);
        getChunk();
      };
      const fileSizeValue = size instanceof Function ? size() : size;
      if (fileSizeValue instanceof Promise) {
        fileSizeValue.then(runReadDataLoop).catch(error => {
          callback(null, unknownToError(error));
        });
      } else {
        runReadDataLoop(fileSizeValue);
      }
    }

    /**
     * Close the MediaInfoLib WASM instance.
     *
     * @group General Use
     */
    close() {
      if (typeof this.mediainfoModuleInstance.close === 'function') {
        this.mediainfoModuleInstance.close();
      }
      if (typeof this.mediainfoModule.destroy === 'function') {
        this.mediainfoModule.destroy(this.mediainfoModuleInstance);
      }
    }

    /**
     * Receive result data from the WASM instance.
     *
     * (This is a low-level MediaInfoLib function.)
     *
     * @returns Result data (format can be configured in options)
     * @group Low-level
     */
    inform() {
      return this.mediainfoModuleInstance.inform();
    }

    /**
     * Send more data to the WASM instance.
     *
     * (This is a low-level MediaInfoLib function.)
     *
     * @param data Data buffer
     * @param size Buffer size
     * @returns Processing state: `0` (no bits set) = not finished, Bit `0` set = enough data read for providing information
     * @group Low-level
     */
    openBufferContinue(data, size) {
      // bit 3 set -> done
      return !!(this.mediainfoModuleInstance.open_buffer_continue(data, size) & 0x08);
    }

    /**
     * Retrieve seek position from WASM instance.
     * The MediaInfoLib function `Open_Buffer_GoTo` returns an integer with 64 bit precision.
     * It would be cut at 32 bit due to the JavaScript bindings. Here we transport the low and high
     * parts separately and put them together.
     *
     * (This is a low-level MediaInfoLib function.)
     *
     * @returns Seek position (where MediaInfoLib wants go in the data buffer)
     * @group Low-level
     */
    openBufferContinueGotoGet() {
      // JS bindings don't support 64 bit int
      // https://github.com/buzz/mediainfo.js/issues/11
      let seekTo = -1;
      const seekToLow = this.mediainfoModuleInstance.open_buffer_continue_goto_get_lower();
      const seekToHigh = this.mediainfoModuleInstance.open_buffer_continue_goto_get_upper();
      if (seekToLow == -1 && seekToHigh == -1) {
        seekTo = -1;
      } else if (seekToLow < 0) {
        seekTo = seekToLow + MAX_UINT32_PLUS_ONE + seekToHigh * MAX_UINT32_PLUS_ONE;
      } else {
        seekTo = seekToLow + seekToHigh * MAX_UINT32_PLUS_ONE;
      }
      return seekTo;
    }

    /**
     * Inform MediaInfoLib that no more data is being read.
     *
     * (This is a low-level MediaInfoLib function.)
     *
     * @group Low-level
     */
    openBufferFinalize() {
      this.mediainfoModuleInstance.open_buffer_finalize();
    }

    /**
     * Prepare MediaInfoLib to process a data buffer.
     *
     * (This is a low-level MediaInfoLib function.)
     *
     * @param size Expected buffer size
     * @param offset Buffer offset
     * @group Low-level
     */
    openBufferInit(size, offset) {
      this.mediainfoModuleInstance.open_buffer_init(size, offset);
    }

    /**
     * Parse result JSON. Convert integer/float fields.
     *
     * @param result Serialized JSON from MediaInfo
     * @returns Parsed JSON object
     */
    parseResultJson(resultString) {
      const intFields = INT_FIELDS;
      const floatFields = FLOAT_FIELDS;

      // Parse JSON
      const result = JSON.parse(resultString);
      if (result.media) {
        const newMedia = _objectSpread2(_objectSpread2({}, result.media), {}, {
          track: []
        });
        if (Array.isArray(result.media.track)) {
          for (const track of result.media.track) {
            let newTrack = {
              '@type': track['@type']
            };
            for (const [key, val] of Object.entries(track)) {
              if (key === '@type') {
                continue;
              }
              if (typeof val === 'string' && intFields.includes(key)) {
                newTrack = _objectSpread2(_objectSpread2({}, newTrack), {}, {
                  [key]: Number.parseInt(val, 10)
                });
              } else if (typeof val === 'string' && floatFields.includes(key)) {
                newTrack = _objectSpread2(_objectSpread2({}, newTrack), {}, {
                  [key]: Number.parseFloat(val)
                });
              } else {
                newTrack = _objectSpread2(_objectSpread2({}, newTrack), {}, {
                  [key]: val
                });
              }
            }
            newMedia.track.push(newTrack);
          }
        }
        return _objectSpread2(_objectSpread2({}, result), {}, {
          media: newMedia
        });
      }
      return result;
    }
  }

  var Module = (() => {
    var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;

    return function (moduleArg = {}) {
      var moduleRtn;

      // include: shell.js
      // The Module object: Our interface to the outside world. We import
      // and export values on it. There are various ways Module can be used:
      // 1. Not defined. We create it here
      // 2. A function parameter, function(moduleArg) => Promise<Module>
      // 3. pre-run appended it, var Module = {}; ..generated code..
      // 4. External script tag defines var Module.
      // We need to check if Module already exists (e.g. case 3 above).
      // Substitution will be replaced with actual code on later stage of the build,
      // this way Closure Compiler will not mangle it (e.g. case 4. above).
      // Note that if you want to run closure, and also to use Module
      // after the generated code, you will need to define   var Module = {};
      // before the code. Then that object will be used in the code, and you
      // can continue to use Module afterwards as well.
      var Module = Object.assign({}, moduleArg);

      // Set up the promise that indicates the Module is initialized
      var readyPromiseResolve, readyPromiseReject;
      var readyPromise = new Promise((resolve, reject) => {
        readyPromiseResolve = resolve;
        readyPromiseReject = reject;
      });

      // --pre-jses are emitted after the Module integration code, so that they can
      // refer to Module (if they choose; they can also define Module)

      // Sometimes an existing Module object exists with properties
      // meant to overwrite the default module functionality. Here
      // we collect those properties and reapply _after_ we configure
      // the current environment's defaults to avoid having to be so
      // defensive during initialization.
      var moduleOverrides = Object.assign({}, Module);
      var thisProgram = './this.program';

      // `/` should be present at the end if `scriptDirectory` is not empty
      var scriptDirectory = '';
      function locateFile(path) {
        if (Module['locateFile']) {
          return Module['locateFile'](path, scriptDirectory)
        }
        return scriptDirectory + path
      }

      // Note that this includes Node.js workers when relevant (pthreads is enabled).
      // Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
      // ENVIRONMENT_IS_NODE.
      {
        if (typeof document != 'undefined' && document.currentScript) {
          // web
          scriptDirectory = document.currentScript.src;
        }
        // When MODULARIZE, this JS may be executed later, after document.currentScript
        // is gone, so we saved it, and we use it here instead of any other info.
        if (_scriptName) {
          scriptDirectory = _scriptName;
        }
        // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
        // otherwise, slice off the final part of the url to find the script directory.
        // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
        // and scriptDirectory will correctly be replaced with an empty string.
        // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
        // they are removed because they could contain a slash.
        if (scriptDirectory.startsWith('blob:')) {
          scriptDirectory = '';
        } else {
          scriptDirectory = scriptDirectory.substr(
            0,
            scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1
          );
        }
      }

      console.log.bind(console);
      var err = console.error.bind(console);

      // Merge back in the overrides
      Object.assign(Module, moduleOverrides);
      // Free the object hierarchy contained in the overrides, this lets the GC
      // reclaim data used.
      moduleOverrides = null;

      // Emit code to handle expected values on the Module object. This applies Module.x
      // to the proper local x. This has two benefits: first, we only emit it if it is
      // expected to arrive, and second, by using a local everywhere else that can be
      // minified.

      // perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
      // end include: shell.js

      // include: preamble.js
      // === Preamble library stuff ===

      // Documentation for the public APIs defined in this file must be updated in:
      //    site/source/docs/api_reference/preamble.js.rst
      // A prebuilt local version of the documentation is available at:
      //    site/build/text/docs/api_reference/preamble.js.txt
      // You can also build docs locally as HTML or other formats in site/
      // An online HTML version (which may be of a different version of Emscripten)
      //    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

      var wasmBinary;

      // Wasm globals

      var wasmMemory;

      //========================================
      // Runtime essentials
      //========================================

      // whether we are quitting the application. no code should run after this.
      // set in exit() and abort()
      var ABORT = false;

      // Memory management

      var /** @type {!Int8Array} */
        HEAP8,
        /** @type {!Uint8Array} */
        HEAPU8,
        /** @type {!Int16Array} */
        HEAP16,
        /** @type {!Uint16Array} */
        HEAPU16,
        /** @type {!Int32Array} */
        HEAP32,
        /** @type {!Uint32Array} */
        HEAPU32,
        /** @type {!Float32Array} */
        HEAPF32,
        /** @type {!Float64Array} */
        HEAPF64;

      // include: runtime_shared.js
      function updateMemoryViews() {
        var b = wasmMemory.buffer;
        Module['HEAP8'] = HEAP8 = new Int8Array(b);
        Module['HEAP16'] = HEAP16 = new Int16Array(b);
        Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
        Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
        Module['HEAP32'] = HEAP32 = new Int32Array(b);
        Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
        Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
        Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
      }
      // end include: runtime_shared.js
      // include: runtime_stack_check.js
      // end include: runtime_stack_check.js
      // include: runtime_assertions.js
      // end include: runtime_assertions.js
      var __ATPRERUN__ = []; // functions called before the runtime is initialized
      var __ATINIT__ = []; // functions called during startup
      var __ATPOSTRUN__ = []; // functions called after the main() is called

      function preRun() {
        callRuntimeCallbacks(__ATPRERUN__);
      }

      function initRuntime() {

        callRuntimeCallbacks(__ATINIT__);
      }

      function postRun() {
        callRuntimeCallbacks(__ATPOSTRUN__);
      }

      function addOnInit(cb) {
        __ATINIT__.unshift(cb);
      }

      // include: runtime_math.js
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

      // end include: runtime_math.js
      // A counter of dependencies for calling run(). If we need to
      // do asynchronous work before running, increment this and
      // decrement it. Incrementing must happen in a place like
      // Module.preRun (used by emcc to add file preloading).
      // Note that you can add dependencies in preRun, even though
      // it happens right before run - run will be postponed until
      // the dependencies are met.
      var runDependencies = 0;
      var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

      function addRunDependency(id) {
        runDependencies++;
      }

      function removeRunDependency(id) {
        runDependencies--;

        if (runDependencies == 0) {
          if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback(); // can add another dependenciesFulfilled
          }
        }
      }

      /** @param {string|number=} what */
      function abort(what) {
        what = 'Aborted(' + what + ')';
        // TODO(sbc): Should we remove printing and leave it up to whoever
        // catches the exception?
        err(what);

        ABORT = true;

        what += '. Build with -sASSERTIONS for more info.';

        // Use a wasm runtime error, because a JS error might be seen as a foreign
        // exception, which means we'd run destructors on it. We need the error to
        // simply make the program stop.
        // FIXME This approach does not work in Wasm EH because it currently does not assume
        // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
        // a trap or not based on a hidden field within the object. So at the moment
        // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
        // allows this in the wasm spec.

        // Suppress closure compiler warning here. Closure compiler's builtin extern
        // definition for WebAssembly.RuntimeError claims it takes no arguments even
        // though it can.
        // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
        /** @suppress {checkTypes} */
        var e = new WebAssembly.RuntimeError(what);

        readyPromiseReject(e);
        // Throw the error whether or not MODULARIZE is set because abort is used
        // in code paths apart from instantiation where an exception is expected
        // to be thrown when abort is called.
        throw e
      }

      // include: memoryprofiler.js
      // end include: memoryprofiler.js
      // include: URIUtils.js
      // Prefix of data URIs emitted by SINGLE_FILE and related options.
      var dataURIPrefix = 'data:application/octet-stream;base64,';

      /**
       * Indicates whether filename is a base64 data URI.
       * @noinline
       */
      var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
      // end include: URIUtils.js
      // include: runtime_exceptions.js
      // end include: runtime_exceptions.js
      function findWasmBinary() {
        var f = 'MediaInfoModule.wasm';
        if (!isDataURI(f)) {
          return locateFile(f)
        }
        return f
      }

      var wasmBinaryFile;

      function getBinarySync(file) {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary)
        }
        throw 'both async and sync fetching of the wasm failed'
      }

      function getBinaryPromise(binaryFile) {
        // If we don't have the binary yet, try to load it asynchronously.
        // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
        // See https://github.com/github/fetch/pull/92#issuecomment-140665932
        // Cordova or Electron apps are typically loaded from a file:// url.
        // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
        {
          if (typeof fetch == 'function') {
            return fetch(binaryFile, { credentials: 'same-origin' })
              .then((response) => {
                if (!response['ok']) {
                  throw `failed to load wasm binary file at '${binaryFile}'`
                }
                return response['arrayBuffer']()
              })
              .catch(() => getBinarySync(binaryFile))
          }
        }

        // Otherwise, getBinarySync should be able to get it synchronously
        return Promise.resolve().then(() => getBinarySync(binaryFile))
      }

      function instantiateArrayBuffer(binaryFile, imports, receiver) {
        return getBinaryPromise(binaryFile)
          .then((binary) => {
            return WebAssembly.instantiate(binary, imports)
          })
          .then(receiver, (reason) => {
            err(`failed to asynchronously prepare wasm: ${reason}`);

            abort(reason);
          })
      }

      function instantiateAsync(binary, binaryFile, imports, callback) {
        if (
          typeof WebAssembly.instantiateStreaming == 'function' &&
          !isDataURI(binaryFile) &&
          typeof fetch == 'function'
        ) {
          return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
            // Suppress closure warning here since the upstream definition for
            // instantiateStreaming only allows Promise<Repsponse> rather than
            // an actual Response.
            // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
            /** @suppress {checkTypes} */
            var result = WebAssembly.instantiateStreaming(response, imports);

            return result.then(callback, function (reason) {
              // We expect the most common failure cause to be a bad MIME type for the binary,
              // in which case falling back to ArrayBuffer instantiation should work.
              err(`wasm streaming compile failed: ${reason}`);
              err('falling back to ArrayBuffer instantiation');
              return instantiateArrayBuffer(binaryFile, imports, callback)
            })
          })
        }
        return instantiateArrayBuffer(binaryFile, imports, callback)
      }

      function getWasmImports() {
        // prepare imports
        return {
          env: wasmImports,
          wasi_snapshot_preview1: wasmImports,
        }
      }

      // Create the wasm instance.
      // Receives the wasm imports, returns the exports.
      function createWasm() {
        var info = getWasmImports();
        // Load the wasm module and create an instance of using native support in the JS engine.
        // handle a generated wasm instance, receiving its exports and
        // performing other necessary setup
        /** @param {WebAssembly.Module=} module*/
        function receiveInstance(instance, module) {
          wasmExports = instance.exports;

          wasmMemory = wasmExports['memory'];

          updateMemoryViews();

          wasmTable = wasmExports['__indirect_function_table'];

          addOnInit(wasmExports['__wasm_call_ctors']);

          removeRunDependency();
          return wasmExports
        }
        // wait for the pthread pool (if any)
        addRunDependency();

        // Prefer streaming instantiation if available.
        function receiveInstantiationResult(result) {
          // 'result' is a ResultObject object which has both the module and instance.
          // receiveInstance() will swap in the exports (to Module.asm) so they can be called
          // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
          // When the regression is fixed, can restore the above PTHREADS-enabled path.
          receiveInstance(result['instance']);
        }

        if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();

        // If instantiation fails, reject the module ready promise.
        instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult).catch(
          readyPromiseReject
        );
        return {} // no exports yet; we'll fill them in later
      }

      var callRuntimeCallbacks = (callbacks) => {
        while (callbacks.length > 0) {
          // Pass the module as the first argument.
          callbacks.shift()(Module);
        }
      };

      var __abort_js = () => {
        abort('');
      };

      var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {};

      var embind_init_charCodes = () => {
        var codes = new Array(256);
        for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
        }
        embind_charCodes = codes;
      };
      var embind_charCodes;
      var readLatin1String = (ptr) => {
        var ret = '';
        var c = ptr;
        while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
        }
        return ret
      };

      var awaitingDependencies = {};

      var registeredTypes = {};

      var typeDependencies = {};

      var BindingError;
      var throwBindingError = (message) => {
        throw new BindingError(message)
      };

      var InternalError;
      var throwInternalError = (message) => {
        throw new InternalError(message)
      };
      var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
        myTypes.forEach(function (type) {
          typeDependencies[type] = dependentTypes;
        });

        function onComplete(typeConverters) {
          var myTypeConverters = getTypeConverters(typeConverters);
          if (myTypeConverters.length !== myTypes.length) {
            throwInternalError('Mismatched type converter count');
          }
          for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i]);
          }
        }

        var typeConverters = new Array(dependentTypes.length);
        var unregisteredTypes = [];
        var registered = 0;
        dependentTypes.forEach((dt, i) => {
          if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt];
          } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
              awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(() => {
              typeConverters[i] = registeredTypes[dt];
              ++registered;
              if (registered === unregisteredTypes.length) {
                onComplete(typeConverters);
              }
            });
          }
        });
        if (0 === unregisteredTypes.length) {
          onComplete(typeConverters);
        }
      };
      /** @param {Object=} options */
      function sharedRegisterType(rawType, registeredInstance, options = {}) {
        var name = registeredInstance.name;
        if (!rawType) {
          throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
        }
        if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
            return
          } else {
            throwBindingError(`Cannot register type '${name}' twice`);
          }
        }

        registeredTypes[rawType] = registeredInstance;
        delete typeDependencies[rawType];

        if (awaitingDependencies.hasOwnProperty(rawType)) {
          var callbacks = awaitingDependencies[rawType];
          delete awaitingDependencies[rawType];
          callbacks.forEach((cb) => cb());
        }
      }
      /** @param {Object=} options */
      function registerType(rawType, registeredInstance, options = {}) {
        if (!('argPackAdvance' in registeredInstance)) {
          throw new TypeError('registerType registeredInstance requires argPackAdvance')
        }
        return sharedRegisterType(rawType, registeredInstance, options)
      }

      var GenericWireTypeSize = 8;
      /** @suppress {globalThis} */
      var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
        name = readLatin1String(name);
        registerType(rawType, {
          name,
          fromWireType: function (wt) {
            // ambiguous emscripten ABI: sometimes return values are
            // true or false, and sometimes integers (0 or 1)
            return !!wt
          },
          toWireType: function (destructors, o) {
            return o ? trueValue : falseValue
          },
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: function (pointer) {
            return this['fromWireType'](HEAPU8[pointer])
          },
          destructorFunction: null, // This type does not need a destructor
        });
      };

      var shallowCopyInternalPointer = (o) => {
        return {
          count: o.count,
          deleteScheduled: o.deleteScheduled,
          preservePointerOnDelete: o.preservePointerOnDelete,
          ptr: o.ptr,
          ptrType: o.ptrType,
          smartPtr: o.smartPtr,
          smartPtrType: o.smartPtrType,
        }
      };

      var throwInstanceAlreadyDeleted = (obj) => {
        function getInstanceTypeName(handle) {
          return handle.$$.ptrType.registeredClass.name
        }
        throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
      };

      var finalizationRegistry = false;

      var detachFinalizer = (handle) => {};

      var runDestructor = ($$) => {
        if ($$.smartPtr) {
          $$.smartPtrType.rawDestructor($$.smartPtr);
        } else {
          $$.ptrType.registeredClass.rawDestructor($$.ptr);
        }
      };
      var releaseClassHandle = ($$) => {
        $$.count.value -= 1;
        var toDelete = 0 === $$.count.value;
        if (toDelete) {
          runDestructor($$);
        }
      };

      var downcastPointer = (ptr, ptrClass, desiredClass) => {
        if (ptrClass === desiredClass) {
          return ptr
        }
        if (undefined === desiredClass.baseClass) {
          return null // no conversion
        }

        var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
        if (rv === null) {
          return null
        }
        return desiredClass.downcast(rv)
      };

      var registeredPointers = {};

      var getInheritedInstanceCount = () => Object.keys(registeredInstances).length;

      var getLiveInheritedInstances = () => {
        var rv = [];
        for (var k in registeredInstances) {
          if (registeredInstances.hasOwnProperty(k)) {
            rv.push(registeredInstances[k]);
          }
        }
        return rv
      };

      var deletionQueue = [];
      var flushPendingDeletes = () => {
        while (deletionQueue.length) {
          var obj = deletionQueue.pop();
          obj.$$.deleteScheduled = false;
          obj['delete']();
        }
      };

      var delayFunction;

      var setDelayFunction = (fn) => {
        delayFunction = fn;
        if (deletionQueue.length && delayFunction) {
          delayFunction(flushPendingDeletes);
        }
      };
      var init_embind = () => {
        Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
        Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
        Module['flushPendingDeletes'] = flushPendingDeletes;
        Module['setDelayFunction'] = setDelayFunction;
      };
      var registeredInstances = {};

      var getBasestPointer = (class_, ptr) => {
        if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
        }
        while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
        }
        return ptr
      };
      var getInheritedInstance = (class_, ptr) => {
        ptr = getBasestPointer(class_, ptr);
        return registeredInstances[ptr]
      };

      var makeClassHandle = (prototype, record) => {
        if (!record.ptrType || !record.ptr) {
          throwInternalError('makeClassHandle requires ptr and ptrType');
        }
        var hasSmartPtrType = !!record.smartPtrType;
        var hasSmartPtr = !!record.smartPtr;
        if (hasSmartPtrType !== hasSmartPtr) {
          throwInternalError('Both smartPtrType and smartPtr must be specified');
        }
        record.count = { value: 1 };
        return attachFinalizer(
          Object.create(prototype, {
            $$: {
              value: record,
              writable: true,
            },
          })
        )
      };
      /** @suppress {globalThis} */
      function RegisteredPointer_fromWireType(ptr) {
        // ptr is a raw pointer (or a raw smartpointer)

        // rawPointer is a maybe-null raw pointer
        var rawPointer = this.getPointee(ptr);
        if (!rawPointer) {
          this.destructor(ptr);
          return null
        }

        var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
        if (undefined !== registeredInstance) {
          // JS object has been neutered, time to repopulate it
          if (0 === registeredInstance.$$.count.value) {
            registeredInstance.$$.ptr = rawPointer;
            registeredInstance.$$.smartPtr = ptr;
            return registeredInstance['clone']()
          } else {
            // else, just increment reference count on existing object
            // it already has a reference to the smart pointer
            var rv = registeredInstance['clone']();
            this.destructor(ptr);
            return rv
          }
        }

        function makeDefaultHandle() {
          if (this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, {
              ptrType: this.pointeeType,
              ptr: rawPointer,
              smartPtrType: this,
              smartPtr: ptr,
            })
          } else {
            return makeClassHandle(this.registeredClass.instancePrototype, {
              ptrType: this,
              ptr,
            })
          }
        }

        var actualType = this.registeredClass.getActualType(rawPointer);
        var registeredPointerRecord = registeredPointers[actualType];
        if (!registeredPointerRecord) {
          return makeDefaultHandle.call(this)
        }

        var toType;
        if (this.isConst) {
          toType = registeredPointerRecord.constPointerType;
        } else {
          toType = registeredPointerRecord.pointerType;
        }
        var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
        if (dp === null) {
          return makeDefaultHandle.call(this)
        }
        if (this.isSmartPointer) {
          return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
            smartPtrType: this,
            smartPtr: ptr,
          })
        } else {
          return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
          })
        }
      }
      var attachFinalizer = (handle) => {
        if ('undefined' === typeof FinalizationRegistry) {
          attachFinalizer = (handle) => handle;
          return handle
        }
        // If the running environment has a FinalizationRegistry (see
        // https://github.com/tc39/proposal-weakrefs), then attach finalizers
        // for class handles.  We check for the presence of FinalizationRegistry
        // at run-time, not build-time.
        finalizationRegistry = new FinalizationRegistry((info) => {
          releaseClassHandle(info.$$);
        });
        attachFinalizer = (handle) => {
          var $$ = handle.$$;
          var hasSmartPtr = !!$$.smartPtr;
          if (hasSmartPtr) {
            // We should not call the destructor on raw pointers in case other code expects the pointee to live
            var info = { $$: $$ };
            finalizationRegistry.register(handle, info, handle);
          }
          return handle
        };
        detachFinalizer = (handle) => finalizationRegistry.unregister(handle);
        return attachFinalizer(handle)
      };

      var init_ClassHandle = () => {
        Object.assign(ClassHandle.prototype, {
          isAliasOf(other) {
            if (!(this instanceof ClassHandle)) {
              return false
            }
            if (!(other instanceof ClassHandle)) {
              return false
            }

            var leftClass = this.$$.ptrType.registeredClass;
            var left = this.$$.ptr;
            other.$$ = /** @type {Object} */ (other.$$);
            var rightClass = other.$$.ptrType.registeredClass;
            var right = other.$$.ptr;

            while (leftClass.baseClass) {
              left = leftClass.upcast(left);
              leftClass = leftClass.baseClass;
            }

            while (rightClass.baseClass) {
              right = rightClass.upcast(right);
              rightClass = rightClass.baseClass;
            }

            return leftClass === rightClass && left === right
          },

          clone() {
            if (!this.$$.ptr) {
              throwInstanceAlreadyDeleted(this);
            }

            if (this.$$.preservePointerOnDelete) {
              this.$$.count.value += 1;
              return this
            } else {
              var clone = attachFinalizer(
                Object.create(Object.getPrototypeOf(this), {
                  $$: {
                    value: shallowCopyInternalPointer(this.$$),
                  },
                })
              );

              clone.$$.count.value += 1;
              clone.$$.deleteScheduled = false;
              return clone
            }
          },

          delete() {
            if (!this.$$.ptr) {
              throwInstanceAlreadyDeleted(this);
            }

            if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
              throwBindingError('Object already scheduled for deletion');
            }

            detachFinalizer(this);
            releaseClassHandle(this.$$);

            if (!this.$$.preservePointerOnDelete) {
              this.$$.smartPtr = undefined;
              this.$$.ptr = undefined;
            }
          },

          isDeleted() {
            return !this.$$.ptr
          },

          deleteLater() {
            if (!this.$$.ptr) {
              throwInstanceAlreadyDeleted(this);
            }
            if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
              throwBindingError('Object already scheduled for deletion');
            }
            deletionQueue.push(this);
            if (deletionQueue.length === 1 && delayFunction) {
              delayFunction(flushPendingDeletes);
            }
            this.$$.deleteScheduled = true;
            return this
          },
        });
      };
      /** @constructor */
      function ClassHandle() {}

      var createNamedFunction = (name, body) =>
        Object.defineProperty(body, 'name', {
          value: name,
        });

      var ensureOverloadTable = (proto, methodName, humanName) => {
        if (undefined === proto[methodName].overloadTable) {
          var prevFunc = proto[methodName];
          // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.
          proto[methodName] = function (...args) {
            // TODO This check can be removed in -O3 level "unsafe" optimizations.
            if (!proto[methodName].overloadTable.hasOwnProperty(args.length)) {
              throwBindingError(
                `Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`
              );
            }
            return proto[methodName].overloadTable[args.length].apply(this, args)
          };
          // Move the previous function into the overload table.
          proto[methodName].overloadTable = [];
          proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
        }
      };

      /** @param {number=} numArguments */
      var exposePublicSymbol = (name, value, numArguments) => {
        if (Module.hasOwnProperty(name)) {
          {
            throwBindingError(`Cannot register public name '${name}' twice`);
          }

          // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
          // that routes between the two.
          ensureOverloadTable(Module, name, name);
          if (Module.hasOwnProperty(numArguments)) {
            throwBindingError(
              `Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`
            );
          }
          // Add the new function into the overload table.
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
        }
      };

      var char_0 = 48;

      var char_9 = 57;
      var makeLegalFunctionName = (name) => {
        if (undefined === name) {
          return '_unknown'
        }
        name = name.replace(/[^a-zA-Z0-9_]/g, '$');
        var f = name.charCodeAt(0);
        if (f >= char_0 && f <= char_9) {
          return `_${name}`
        }
        return name
      };

      /** @constructor */
      function RegisteredClass(
        name,
        constructor,
        instancePrototype,
        rawDestructor,
        baseClass,
        getActualType,
        upcast,
        downcast
      ) {
        this.name = name;
        this.constructor = constructor;
        this.instancePrototype = instancePrototype;
        this.rawDestructor = rawDestructor;
        this.baseClass = baseClass;
        this.getActualType = getActualType;
        this.upcast = upcast;
        this.downcast = downcast;
        this.pureVirtualFunctions = [];
      }

      var upcastPointer = (ptr, ptrClass, desiredClass) => {
        while (ptrClass !== desiredClass) {
          if (!ptrClass.upcast) {
            throwBindingError(
              `Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`
            );
          }
          ptr = ptrClass.upcast(ptr);
          ptrClass = ptrClass.baseClass;
        }
        return ptr
      };
      /** @suppress {globalThis} */
      function constNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError(`null is not a valid ${this.name}`);
          }
          return 0
        }

        if (!handle.$$) {
          throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
        }
        if (!handle.$$.ptr) {
          throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr
      }

      /** @suppress {globalThis} */
      function genericPointerToWireType(destructors, handle) {
        var ptr;
        if (handle === null) {
          if (this.isReference) {
            throwBindingError(`null is not a valid ${this.name}`);
          }

          if (this.isSmartPointer) {
            ptr = this.rawConstructor();
            if (destructors !== null) {
              destructors.push(this.rawDestructor, ptr);
            }
            return ptr
          } else {
            return 0
          }
        }

        if (!handle || !handle.$$) {
          throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
        }
        if (!handle.$$.ptr) {
          throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
        }
        if (!this.isConst && handle.$$.ptrType.isConst) {
          throwBindingError(
            `Cannot convert argument of type ${handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name} to parameter type ${this.name}`
          );
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);

        if (this.isSmartPointer) {
          // TODO: this is not strictly true
          // We could support BY_EMVAL conversions from raw pointers to smart pointers
          // because the smart pointer can hold a reference to the handle
          if (undefined === handle.$$.smartPtr) {
            throwBindingError('Passing raw pointer to smart pointer is illegal');
          }

          switch (this.sharingPolicy) {
            case 0: // NONE
              // no upcasting
              if (handle.$$.smartPtrType === this) {
                ptr = handle.$$.smartPtr;
              } else {
                throwBindingError(
                  `Cannot convert argument of type ${handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name} to parameter type ${this.name}`
                );
              }
              break

            case 1: // INTRUSIVE
              ptr = handle.$$.smartPtr;
              break

            case 2: // BY_EMVAL
              if (handle.$$.smartPtrType === this) {
                ptr = handle.$$.smartPtr;
              } else {
                var clonedHandle = handle['clone']();
                ptr = this.rawShare(
                  ptr,
                  Emval.toHandle(() => clonedHandle['delete']())
                );
                if (destructors !== null) {
                  destructors.push(this.rawDestructor, ptr);
                }
              }
              break

            default:
              throwBindingError('Unsupporting sharing policy');
          }
        }
        return ptr
      }

      /** @suppress {globalThis} */
      function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
        if (handle === null) {
          if (this.isReference) {
            throwBindingError(`null is not a valid ${this.name}`);
          }
          return 0
        }

        if (!handle.$$) {
          throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
        }
        if (!handle.$$.ptr) {
          throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
        }
        if (handle.$$.ptrType.isConst) {
          throwBindingError(
            `Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`
          );
        }
        var handleClass = handle.$$.ptrType.registeredClass;
        var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
        return ptr
      }

      /** @suppress {globalThis} */
      function readPointer(pointer) {
        return this['fromWireType'](HEAPU32[pointer >> 2])
      }

      var init_RegisteredPointer = () => {
        Object.assign(RegisteredPointer.prototype, {
          getPointee(ptr) {
            if (this.rawGetPointee) {
              ptr = this.rawGetPointee(ptr);
            }
            return ptr
          },
          destructor(ptr) {
            this.rawDestructor?.(ptr);
          },
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: readPointer,
          fromWireType: RegisteredPointer_fromWireType,
        });
      };
      /** @constructor
        @param {*=} pointeeType,
        @param {*=} sharingPolicy,
        @param {*=} rawGetPointee,
        @param {*=} rawConstructor,
        @param {*=} rawShare,
        @param {*=} rawDestructor,
         */
      function RegisteredPointer(
        name,
        registeredClass,
        isReference,
        isConst,

        // smart pointer properties
        isSmartPointer,
        pointeeType,
        sharingPolicy,
        rawGetPointee,
        rawConstructor,
        rawShare,
        rawDestructor
      ) {
        this.name = name;
        this.registeredClass = registeredClass;
        this.isReference = isReference;
        this.isConst = isConst;

        // smart pointer properties
        this.isSmartPointer = isSmartPointer;
        this.pointeeType = pointeeType;
        this.sharingPolicy = sharingPolicy;
        this.rawGetPointee = rawGetPointee;
        this.rawConstructor = rawConstructor;
        this.rawShare = rawShare;
        this.rawDestructor = rawDestructor;

        if (!isSmartPointer && registeredClass.baseClass === undefined) {
          if (isConst) {
            this['toWireType'] = constNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
          } else {
            this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
          }
        } else {
          this['toWireType'] = genericPointerToWireType;
          // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
          // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
          // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in
          //       craftInvokerFunction altogether.
        }
      }

      /** @param {number=} numArguments */
      var replacePublicSymbol = (name, value, numArguments) => {
        if (!Module.hasOwnProperty(name)) {
          throwInternalError('Replacing nonexistent public symbol');
        }
        // If there's an overload table for this symbol, replace the symbol in the overload table instead.
        if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
          Module[name].overloadTable[numArguments] = value;
        } else {
          Module[name] = value;
          Module[name].argCount = numArguments;
        }
      };

      var dynCallLegacy = (sig, ptr, args) => {
        sig = sig.replace(/p/g, 'i');
        var f = Module['dynCall_' + sig];
        return f(ptr, ...args)
      };

      var wasmTableMirror = [];

      /** @type {WebAssembly.Table} */
      var wasmTable;
      var getWasmTableEntry = (funcPtr) => {
        var func = wasmTableMirror[funcPtr];
        if (!func) {
          if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
          wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
        }
        return func
      };

      var dynCall = (sig, ptr, args = []) => {
        // Without WASM_BIGINT support we cannot directly call function with i64 as
        // part of their signature, so we rely on the dynCall functions generated by
        // wasm-emscripten-finalize
        if (sig.includes('j')) {
          return dynCallLegacy(sig, ptr, args)
        }
        var rtn = getWasmTableEntry(ptr)(...args);
        return rtn
      };
      var getDynCaller = (sig, ptr) => {
        return (...args) => dynCall(sig, ptr, args)
      };

      var embind__requireFunction = (signature, rawFunction) => {
        signature = readLatin1String(signature);

        function makeDynCaller() {
          if (signature.includes('j')) {
            return getDynCaller(signature, rawFunction)
          }
          return getWasmTableEntry(rawFunction)
        }

        var fp = makeDynCaller();
        if (typeof fp != 'function') {
          throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
        }
        return fp
      };

      var extendError = (baseErrorType, errorName) => {
        var errorClass = createNamedFunction(errorName, function (message) {
          this.name = errorName;
          this.message = message;

          var stack = new Error(message).stack;
          if (stack !== undefined) {
            this.stack = this.toString() + '\n' + stack.replace(/^Error(:[^\n]*)?\n/, '');
          }
        });
        errorClass.prototype = Object.create(baseErrorType.prototype);
        errorClass.prototype.constructor = errorClass;
        errorClass.prototype.toString = function () {
          if (this.message === undefined) {
            return this.name
          } else {
            return `${this.name}: ${this.message}`
          }
        };

        return errorClass
      };
      var UnboundTypeError;

      var getTypeName = (type) => {
        var ptr = ___getTypeName(type);
        var rv = readLatin1String(ptr);
        _free(ptr);
        return rv
      };
      var throwUnboundTypeError = (message, types) => {
        var unboundTypes = [];
        var seen = {};
        function visit(type) {
          if (seen[type]) {
            return
          }
          if (registeredTypes[type]) {
            return
          }
          if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return
          }
          unboundTypes.push(type);
          seen[type] = true;
        }
        types.forEach(visit);

        throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([', ']))
      };

      var __embind_register_class = (
        rawType,
        rawPointerType,
        rawConstPointerType,
        baseClassRawType,
        getActualTypeSignature,
        getActualType,
        upcastSignature,
        upcast,
        downcastSignature,
        downcast,
        name,
        destructorSignature,
        rawDestructor
      ) => {
        name = readLatin1String(name);
        getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
        upcast &&= embind__requireFunction(upcastSignature, upcast);
        downcast &&= embind__requireFunction(downcastSignature, downcast);
        rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
        var legalFunctionName = makeLegalFunctionName(name);

        exposePublicSymbol(legalFunctionName, function () {
          // this code cannot run if baseClassRawType is zero
          throwUnboundTypeError(`Cannot construct ${name} due to unbound types`, [baseClassRawType]);
        });

        whenDependentTypesAreResolved(
          [rawType, rawPointerType, rawConstPointerType],
          baseClassRawType ? [baseClassRawType] : [],
          (base) => {
            base = base[0];

            var baseClass;
            var basePrototype;
            if (baseClassRawType) {
              baseClass = base.registeredClass;
              basePrototype = baseClass.instancePrototype;
            } else {
              basePrototype = ClassHandle.prototype;
            }

            var constructor = createNamedFunction(name, function (...args) {
              if (Object.getPrototypeOf(this) !== instancePrototype) {
                throw new BindingError("Use 'new' to construct " + name)
              }
              if (undefined === registeredClass.constructor_body) {
                throw new BindingError(name + ' has no accessible constructor')
              }
              var body = registeredClass.constructor_body[args.length];
              if (undefined === body) {
                throw new BindingError(
                  `Tried to invoke ctor of ${name} with invalid number of parameters (${args.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`
                )
              }
              return body.apply(this, args)
            });

            var instancePrototype = Object.create(basePrototype, {
              constructor: { value: constructor },
            });

            constructor.prototype = instancePrototype;

            var registeredClass = new RegisteredClass(
              name,
              constructor,
              instancePrototype,
              rawDestructor,
              baseClass,
              getActualType,
              upcast,
              downcast
            );

            if (registeredClass.baseClass) {
              // Keep track of class hierarchy. Used to allow sub-classes to inherit class functions.
              registeredClass.baseClass.__derivedClasses ??= [];

              registeredClass.baseClass.__derivedClasses.push(registeredClass);
            }

            var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);

            var pointerConverter = new RegisteredPointer(
              name + '*',
              registeredClass,
              false,
              false,
              false
            );

            var constPointerConverter = new RegisteredPointer(
              name + ' const*',
              registeredClass,
              false,
              true,
              false
            );

            registeredPointers[rawType] = {
              pointerType: pointerConverter,
              constPointerType: constPointerConverter,
            };

            replacePublicSymbol(legalFunctionName, constructor);

            return [referenceConverter, pointerConverter, constPointerConverter]
          }
        );
      };

      var heap32VectorToArray = (count, firstElement) => {
        var array = [];
        for (var i = 0; i < count; i++) {
          // TODO(https://github.com/emscripten-core/emscripten/issues/17310):
          // Find a way to hoist the `>> 2` or `>> 3` out of this loop.
          array.push(HEAPU32[(firstElement + i * 4) >> 2]);
        }
        return array
      };

      var runDestructors = (destructors) => {
        while (destructors.length) {
          var ptr = destructors.pop();
          var del = destructors.pop();
          del(ptr);
        }
      };

      function usesDestructorStack(argTypes) {
        // Skip return value at index 0 - it's not deleted here.
        for (var i = 1; i < argTypes.length; ++i) {
          // The type does not define a destructor function - must use dynamic stack
          if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
            return true
          }
        }
        return false
      }

      function newFunc(constructor, argumentList) {
        if (!(constructor instanceof Function)) {
          throw new TypeError(
            `new_ called with constructor type ${typeof constructor} which is not a function`
          )
        }
        /*
         * Previously, the following line was just:
         *   function dummy() {};
         * Unfortunately, Chrome was preserving 'dummy' as the object's name, even
         * though at creation, the 'dummy' has the correct constructor name.  Thus,
         * objects created with IMVU.new would show up in the debugger as 'dummy',
         * which isn't very helpful.  Using IMVU.createNamedFunction addresses the
         * issue.  Doubly-unfortunately, there's no way to write a test for this
         * behavior.  -NRD 2013.02.22
         */
        var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function () {});
        dummy.prototype = constructor.prototype;
        var obj = new dummy();

        var r = constructor.apply(obj, argumentList);
        return r instanceof Object ? r : obj
      }

      function createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync) {
        var needsDestructorStack = usesDestructorStack(argTypes);
        var argCount = argTypes.length;
        var argsList = '';
        var argsListWired = '';
        for (var i = 0; i < argCount - 2; ++i) {
          argsList += (i !== 0 ? ', ' : '') + 'arg' + i;
          argsListWired += (i !== 0 ? ', ' : '') + 'arg' + i + 'Wired';
        }

        var invokerFnBody = `
        return function (${argsList}) {
        if (arguments.length !== ${argCount - 2}) {
          throwBindingError('function ' + humanName + ' called with ' + arguments.length + ' arguments, expected ${argCount - 2}');
        }`;

        if (needsDestructorStack) {
          invokerFnBody += 'var destructors = [];\n';
        }

        var dtorStack = needsDestructorStack ? 'destructors' : 'null';
        var args1 = [
          'humanName',
          'throwBindingError',
          'invoker',
          'fn',
          'runDestructors',
          'retType',
          'classParam',
        ];

        if (isClassMethodFunc) {
          invokerFnBody += "var thisWired = classParam['toWireType'](" + dtorStack + ', this);\n';
        }

        for (var i = 0; i < argCount - 2; ++i) {
          invokerFnBody +=
            'var arg' +
            i +
            'Wired = argType' +
            i +
            "['toWireType'](" +
            dtorStack +
            ', arg' +
            i +
            ');\n';
          args1.push('argType' + i);
        }

        if (isClassMethodFunc) {
          argsListWired = 'thisWired' + (argsListWired.length > 0 ? ', ' : '') + argsListWired;
        }

        invokerFnBody +=
          (returns || isAsync ? 'var rv = ' : '') +
          'invoker(fn' +
          (argsListWired.length > 0 ? ', ' : '') +
          argsListWired +
          ');\n';

        if (needsDestructorStack) {
          invokerFnBody += 'runDestructors(destructors);\n';
        } else {
          for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
            // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
            var paramName = i === 1 ? 'thisWired' : 'arg' + (i - 2) + 'Wired';
            if (argTypes[i].destructorFunction !== null) {
              invokerFnBody += `${paramName}_dtor(${paramName});\n`;
              args1.push(`${paramName}_dtor`);
            }
          }
        }

        if (returns) {
          invokerFnBody += "var ret = retType['fromWireType'](rv);\n" + 'return ret;\n';
        }

        invokerFnBody += '}\n';

        return [args1, invokerFnBody]
      }
      function craftInvokerFunction(
        humanName,
        argTypes,
        classType,
        cppInvokerFunc,
        cppTargetFunc,
        /** boolean= */ isAsync
      ) {
        // humanName: a human-readable string name for the function to be generated.
        // argTypes: An array that contains the embind type objects for all types in the function signature.
        //    argTypes[0] is the type object for the function return value.
        //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
        //    argTypes[2...] are the actual function parameters.
        // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
        // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
        // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
        // isAsync: Optional. If true, returns an async function. Async bindings are only supported with JSPI.
        var argCount = argTypes.length;

        if (argCount < 2) {
          throwBindingError(
            "argTypes array size mismatch! Must at least get return value and 'this' types!"
          );
        }

        var isClassMethodFunc = argTypes[1] !== null && classType !== null;

        // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
        // TODO: This omits argument count check - enable only at -O3 or similar.
        //    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
        //       return FUNCTION_TABLE[fn];
        //    }

        // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
        // TODO: Remove this completely once all function invokers are being dynamically generated.
        var needsDestructorStack = usesDestructorStack(argTypes);

        var returns = argTypes[0].name !== 'void';

        // Builld the arguments that will be passed into the closure around the invoker
        // function.
        var closureArgs = [
          humanName,
          throwBindingError,
          cppInvokerFunc,
          cppTargetFunc,
          runDestructors,
          argTypes[0],
          argTypes[1],
        ];
        for (var i = 0; i < argCount - 2; ++i) {
          closureArgs.push(argTypes[i + 2]);
        }
        if (!needsDestructorStack) {
          for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
            // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
            if (argTypes[i].destructorFunction !== null) {
              closureArgs.push(argTypes[i].destructorFunction);
            }
          }
        }

        let [args, invokerFnBody] = createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync);
        args.push(invokerFnBody);
        var invokerFn = newFunc(Function, args)(...closureArgs);
        return createNamedFunction(humanName, invokerFn)
      }
      var __embind_register_class_constructor = (
        rawClassType,
        argCount,
        rawArgTypesAddr,
        invokerSignature,
        invoker,
        rawConstructor
      ) => {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        invoker = embind__requireFunction(invokerSignature, invoker);

        whenDependentTypesAreResolved([], [rawClassType], (classType) => {
          classType = classType[0];
          var humanName = `constructor ${classType.name}`;

          if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = [];
          }
          if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError(
              `Cannot register multiple constructors with identical number of parameters (${argCount - 1}) for class '${classType.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`
            )
          }
          classType.registeredClass.constructor_body[argCount - 1] = () => {
            throwUnboundTypeError(
              `Cannot construct ${classType.name} due to unbound types`,
              rawArgTypes
            );
          };

          whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
            // Insert empty slot for context type (argTypes[1]).
            argTypes.splice(1, 0, null);
            classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(
              humanName,
              argTypes,
              null,
              invoker,
              rawConstructor
            );
            return []
          });
          return []
        });
      };

      var getFunctionName = (signature) => {
        signature = signature.trim();
        const argsIndex = signature.indexOf('(');
        if (argsIndex !== -1) {
          return signature.substr(0, argsIndex)
        } else {
          return signature
        }
      };
      var __embind_register_class_function = (
        rawClassType,
        methodName,
        argCount,
        rawArgTypesAddr, // [ReturnType, ThisType, Args...]
        invokerSignature,
        rawInvoker,
        context,
        isPureVirtual,
        isAsync
      ) => {
        var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
        methodName = readLatin1String(methodName);
        methodName = getFunctionName(methodName);
        rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);

        whenDependentTypesAreResolved([], [rawClassType], (classType) => {
          classType = classType[0];
          var humanName = `${classType.name}.${methodName}`;

          if (methodName.startsWith('@@')) {
            methodName = Symbol[methodName.substring(2)];
          }

          if (isPureVirtual) {
            classType.registeredClass.pureVirtualFunctions.push(methodName);
          }

          function unboundTypesHandler() {
            throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes);
          }

          var proto = classType.registeredClass.instancePrototype;
          var method = proto[methodName];
          if (
            undefined === method ||
            (undefined === method.overloadTable &&
              method.className !== classType.name &&
              method.argCount === argCount - 2)
          ) {
            // This is the first overload to be registered, OR we are replacing a
            // function in the base class with a function in the derived class.
            unboundTypesHandler.argCount = argCount - 2;
            unboundTypesHandler.className = classType.name;
            proto[methodName] = unboundTypesHandler;
          } else {
            // There was an existing function with the same name registered. Set up
            // a function overload routing table.
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
          }

          whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
            var memberFunction = craftInvokerFunction(
              humanName,
              argTypes,
              classType,
              rawInvoker,
              context,
              isAsync
            );

            // Replace the initial unbound-handler-stub function with the
            // appropriate member function, now that all types are resolved. If
            // multiple overloads are registered for this function, the function
            // goes into an overload table.
            if (undefined === proto[methodName].overloadTable) {
              // Set argCount in case an overload is registered later
              memberFunction.argCount = argCount - 2;
              proto[methodName] = memberFunction;
            } else {
              proto[methodName].overloadTable[argCount - 2] = memberFunction;
            }

            return []
          });
          return []
        });
      };

      var emval_freelist = [];

      var emval_handles = [];
      var __emval_decref = (handle) => {
        if (handle > 9 && 0 === --emval_handles[handle + 1]) {
          emval_handles[handle] = undefined;
          emval_freelist.push(handle);
        }
      };

      var count_emval_handles = () => {
        return emval_handles.length / 2 - 5 - emval_freelist.length
      };

      var init_emval = () => {
        // reserve 0 and some special values. These never get de-allocated.
        emval_handles.push(0, 1, undefined, 1, null, 1, true, 1, false, 1);
        Module['count_emval_handles'] = count_emval_handles;
      };
      var Emval = {
        toValue: (handle) => {
          if (!handle) {
            throwBindingError('Cannot use deleted val. handle = ' + handle);
          }
          return emval_handles[handle]
        },
        toHandle: (value) => {
          switch (value) {
            case undefined:
              return 2
            case null:
              return 4
            case true:
              return 6
            case false:
              return 8
            default: {
              const handle = emval_freelist.pop() || emval_handles.length;
              emval_handles[handle] = value;
              emval_handles[handle + 1] = 1;
              return handle
            }
          }
        },
      };

      var EmValType = {
        name: 'emscripten::val',
        fromWireType: (handle) => {
          var rv = Emval.toValue(handle);
          __emval_decref(handle);
          return rv
        },
        toWireType: (destructors, value) => Emval.toHandle(value),
        argPackAdvance: GenericWireTypeSize,
        readValueFromPointer: readPointer,
        destructorFunction: null, // This type does not need a destructor

        // TODO: do we need a deleteObject here?  write a test where
        // emval is passed into JS via an interface
      };
      var __embind_register_emval = (rawType) => registerType(rawType, EmValType);

      var embindRepr = (v) => {
        if (v === null) {
          return 'null'
        }
        var t = typeof v;
        if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString()
        } else {
          return '' + v
        }
      };

      var floatReadValueFromPointer = (name, width) => {
        switch (width) {
          case 4:
            return function (pointer) {
              return this['fromWireType'](HEAPF32[pointer >> 2])
            }
          case 8:
            return function (pointer) {
              return this['fromWireType'](HEAPF64[pointer >> 3])
            }
          default:
            throw new TypeError(`invalid float width (${width}): ${name}`)
        }
      };

      var __embind_register_float = (rawType, name, size) => {
        name = readLatin1String(name);
        registerType(rawType, {
          name,
          fromWireType: (value) => value,
          toWireType: (destructors, value) => {
            // The VM will perform JS to Wasm value conversion, according to the spec:
            // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
            return value
          },
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: floatReadValueFromPointer(name, size),
          destructorFunction: null, // This type does not need a destructor
        });
      };

      var integerReadValueFromPointer = (name, width, signed) => {
        // integers are quite common, so generate very specialized functions
        switch (width) {
          case 1:
            return signed ? (pointer) => HEAP8[pointer] : (pointer) => HEAPU8[pointer]
          case 2:
            return signed ? (pointer) => HEAP16[pointer >> 1] : (pointer) => HEAPU16[pointer >> 1]
          case 4:
            return signed ? (pointer) => HEAP32[pointer >> 2] : (pointer) => HEAPU32[pointer >> 2]
          default:
            throw new TypeError(`invalid integer width (${width}): ${name}`)
        }
      };

      /** @suppress {globalThis} */
      var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
        name = readLatin1String(name);

        var fromWireType = (value) => value;

        if (minRange === 0) {
          var bitshift = 32 - 8 * size;
          fromWireType = (value) => (value << bitshift) >>> bitshift;
        }

        var isUnsignedType = name.includes('unsigned');
        var checkAssertions = (value, toTypeName) => {};
        var toWireType;
        if (isUnsignedType) {
          toWireType = function (destructors, value) {
            checkAssertions(value, this.name);
            return value >>> 0
          };
        } else {
          toWireType = function (destructors, value) {
            checkAssertions(value, this.name);
            // The VM will perform JS to Wasm value conversion, according to the spec:
            // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
            return value
          };
        }
        registerType(primitiveType, {
          name,
          fromWireType: fromWireType,
          toWireType: toWireType,
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: integerReadValueFromPointer(name, size, minRange !== 0),
          destructorFunction: null, // This type does not need a destructor
        });
      };

      var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
        var typeMapping = [
          Int8Array,
          Uint8Array,
          Int16Array,
          Uint16Array,
          Int32Array,
          Uint32Array,
          Float32Array,
          Float64Array,
        ];

        var TA = typeMapping[dataTypeIndex];

        function decodeMemoryView(handle) {
          var size = HEAPU32[handle >> 2];
          var data = HEAPU32[(handle + 4) >> 2];
          return new TA(HEAP8.buffer, data, size)
        }

        name = readLatin1String(name);
        registerType(
          rawType,
          {
            name,
            fromWireType: decodeMemoryView,
            argPackAdvance: GenericWireTypeSize,
            readValueFromPointer: decodeMemoryView,
          },
          {
            ignoreDuplicateRegistrations: true,
          }
        );
      };

      var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
        // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
        // undefined and false each don't write out any bytes.
        if (!(maxBytesToWrite > 0)) return 0

        var startIdx = outIdx;
        var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
        for (var i = 0; i < str.length; ++i) {
          // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
          // unit, not a Unicode code point of the character! So decode
          // UTF16->UTF32->UTF8.
          // See http://unicode.org/faq/utf_bom.html#utf16-3
          // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
          // and https://www.ietf.org/rfc/rfc2279.txt
          // and https://tools.ietf.org/html/rfc3629
          var u = str.charCodeAt(i); // possibly a lead surrogate
          if (u >= 0xd800 && u <= 0xdfff) {
            var u1 = str.charCodeAt(++i);
            u = (0x10000 + ((u & 0x3ff) << 10)) | (u1 & 0x3ff);
          }
          if (u <= 0x7f) {
            if (outIdx >= endIdx) break
            heap[outIdx++] = u;
          } else if (u <= 0x7ff) {
            if (outIdx + 1 >= endIdx) break
            heap[outIdx++] = 0xc0 | (u >> 6);
            heap[outIdx++] = 0x80 | (u & 63);
          } else if (u <= 0xffff) {
            if (outIdx + 2 >= endIdx) break
            heap[outIdx++] = 0xe0 | (u >> 12);
            heap[outIdx++] = 0x80 | ((u >> 6) & 63);
            heap[outIdx++] = 0x80 | (u & 63);
          } else {
            if (outIdx + 3 >= endIdx) break
            heap[outIdx++] = 0xf0 | (u >> 18);
            heap[outIdx++] = 0x80 | ((u >> 12) & 63);
            heap[outIdx++] = 0x80 | ((u >> 6) & 63);
            heap[outIdx++] = 0x80 | (u & 63);
          }
        }
        // Null-terminate the pointer to the buffer.
        heap[outIdx] = 0;
        return outIdx - startIdx
      };
      var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
        return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
      };

      var lengthBytesUTF8 = (str) => {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
          // unit, not a Unicode code point of the character! So decode
          // UTF16->UTF32->UTF8.
          // See http://unicode.org/faq/utf_bom.html#utf16-3
          var c = str.charCodeAt(i); // possibly a lead surrogate
          if (c <= 0x7f) {
            len++;
          } else if (c <= 0x7ff) {
            len += 2;
          } else if (c >= 0xd800 && c <= 0xdfff) {
            len += 4;
            ++i;
          } else {
            len += 3;
          }
        }
        return len
      };

      var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;

      /**
       * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
       * array that contains uint8 values, returns a copy of that string as a
       * Javascript String object.
       * heapOrArray is either a regular array, or a JavaScript typed array view.
       * @param {number} idx
       * @param {number=} maxBytesToRead
       * @return {string}
       */
      var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
        var endIdx = idx + maxBytesToRead;
        var endPtr = idx;
        // TextDecoder needs to know the byte length in advance, it doesn't stop on
        // null terminator by itself.  Also, use the length info to avoid running tiny
        // strings through TextDecoder, since .subarray() allocates garbage.
        // (As a tiny code save trick, compare endPtr against endIdx using a negation,
        // so that undefined means Infinity)
        while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;

        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
          return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr))
        }
        var str = '';
        // If building with TextDecoder, we have already computed the string length
        // above, so test loop end condition against that
        while (idx < endPtr) {
          // For UTF8 byte structure, see:
          // http://en.wikipedia.org/wiki/UTF-8#Description
          // https://www.ietf.org/rfc/rfc2279.txt
          // https://tools.ietf.org/html/rfc3629
          var u0 = heapOrArray[idx++];
          if (!(u0 & 0x80)) {
            str += String.fromCharCode(u0);
            continue
          }
          var u1 = heapOrArray[idx++] & 63;
          if ((u0 & 0xe0) == 0xc0) {
            str += String.fromCharCode(((u0 & 31) << 6) | u1);
            continue
          }
          var u2 = heapOrArray[idx++] & 63;
          if ((u0 & 0xf0) == 0xe0) {
            u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
          } else {
            u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
          }

          if (u0 < 0x10000) {
            str += String.fromCharCode(u0);
          } else {
            var ch = u0 - 0x10000;
            str += String.fromCharCode(0xd800 | (ch >> 10), 0xdc00 | (ch & 0x3ff));
          }
        }
        return str
      };

      /**
       * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
       * emscripten HEAP, returns a copy of that string as a Javascript String object.
       *
       * @param {number} ptr
       * @param {number=} maxBytesToRead - An optional length that specifies the
       *   maximum number of bytes to read. You can omit this parameter to scan the
       *   string until the first 0 byte. If maxBytesToRead is passed, and the string
       *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
       *   string will cut short at that byte index (i.e. maxBytesToRead will not
       *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
       *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
       *   JS JIT optimizations off, so it is worth to consider consistently using one
       * @return {string}
       */
      var UTF8ToString = (ptr, maxBytesToRead) => {
        return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ''
      };
      var __embind_register_std_string = (rawType, name) => {
        name = readLatin1String(name);
        var stdStringIsUTF8 =
          //process only std::string bindings with UTF8 support, in contrast to e.g. std::basic_string<unsigned char>
          name === 'std::string';

        registerType(rawType, {
          name,
          // For some method names we use string keys here since they are part of
          // the public/external API and/or used by the runtime-generated code.
          fromWireType(value) {
            var length = HEAPU32[value >> 2];
            var payload = value + 4;

            var str;
            if (stdStringIsUTF8) {
              var decodeStartPtr = payload;
              // Looping here to support possible embedded '0' bytes
              for (var i = 0; i <= length; ++i) {
                var currentBytePtr = payload + i;
                if (i == length || HEAPU8[currentBytePtr] == 0) {
                  var maxRead = currentBytePtr - decodeStartPtr;
                  var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                  if (str === undefined) {
                    str = stringSegment;
                  } else {
                    str += String.fromCharCode(0);
                    str += stringSegment;
                  }
                  decodeStartPtr = currentBytePtr + 1;
                }
              }
            } else {
              var a = new Array(length);
              for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[payload + i]);
              }
              str = a.join('');
            }

            _free(value);

            return str
          },
          toWireType(destructors, value) {
            if (value instanceof ArrayBuffer) {
              value = new Uint8Array(value);
            }

            var length;
            var valueIsOfTypeString = typeof value == 'string';

            if (
              !(
                valueIsOfTypeString ||
                value instanceof Uint8Array ||
                value instanceof Uint8ClampedArray ||
                value instanceof Int8Array
              )
            ) {
              throwBindingError('Cannot pass non-string to std::string');
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              length = lengthBytesUTF8(value);
            } else {
              length = value.length;
            }

            // assumes POINTER_SIZE alignment
            var base = _malloc(4 + length + 1);
            var ptr = base + 4;
            HEAPU32[base >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
              stringToUTF8(value, ptr, length + 1);
            } else {
              if (valueIsOfTypeString) {
                for (var i = 0; i < length; ++i) {
                  var charCode = value.charCodeAt(i);
                  if (charCode > 255) {
                    _free(ptr);
                    throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                  }
                  HEAPU8[ptr + i] = charCode;
                }
              } else {
                for (var i = 0; i < length; ++i) {
                  HEAPU8[ptr + i] = value[i];
                }
              }
            }

            if (destructors !== null) {
              destructors.push(_free, base);
            }
            return base
          },
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: readPointer,
          destructorFunction(ptr) {
            _free(ptr);
          },
        });
      };

      var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;
      var UTF16ToString = (ptr, maxBytesToRead) => {
        var endPtr = ptr;
        // TextDecoder needs to know the byte length in advance, it doesn't stop on
        // null terminator by itself.
        // Also, use the length info to avoid running tiny strings through
        // TextDecoder, since .subarray() allocates garbage.
        var idx = endPtr >> 1;
        var maxIdx = idx + maxBytesToRead / 2;
        // If maxBytesToRead is not passed explicitly, it will be undefined, and this
        // will always evaluate to true. This saves on code size.
        while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
        endPtr = idx << 1;

        if (endPtr - ptr > 32 && UTF16Decoder)
          return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr))

        // Fallback: decode without UTF16Decoder
        var str = '';

        // If maxBytesToRead is not passed explicitly, it will be undefined, and the
        // for-loop's condition will always evaluate to true. The loop is then
        // terminated on the first null char.
        for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
          var codeUnit = HEAP16[(ptr + i * 2) >> 1];
          if (codeUnit == 0) break
          // fromCharCode constructs a character from a UTF-16 code unit, so we can
          // pass the UTF16 string right through.
          str += String.fromCharCode(codeUnit);
        }

        return str
      };

      var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
        // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
        maxBytesToWrite ??= 0x7fffffff;
        if (maxBytesToWrite < 2) return 0
        maxBytesToWrite -= 2; // Null terminator.
        var startPtr = outPtr;
        var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
        for (var i = 0; i < numCharsToWrite; ++i) {
          // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
          var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
          HEAP16[outPtr >> 1] = codeUnit;
          outPtr += 2;
        }
        // Null-terminate the pointer to the HEAP.
        HEAP16[outPtr >> 1] = 0;
        return outPtr - startPtr
      };

      var lengthBytesUTF16 = (str) => {
        return str.length * 2
      };

      var UTF32ToString = (ptr, maxBytesToRead) => {
        var i = 0;

        var str = '';
        // If maxBytesToRead is not passed explicitly, it will be undefined, and this
        // will always evaluate to true. This saves on code size.
        while (!(i >= maxBytesToRead / 4)) {
          var utf32 = HEAP32[(ptr + i * 4) >> 2];
          if (utf32 == 0) break
          ++i;
          // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
          // See http://unicode.org/faq/utf_bom.html#utf16-3
          if (utf32 >= 0x10000) {
            var ch = utf32 - 0x10000;
            str += String.fromCharCode(0xd800 | (ch >> 10), 0xdc00 | (ch & 0x3ff));
          } else {
            str += String.fromCharCode(utf32);
          }
        }
        return str
      };

      var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
        // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
        maxBytesToWrite ??= 0x7fffffff;
        if (maxBytesToWrite < 4) return 0
        var startPtr = outPtr;
        var endPtr = startPtr + maxBytesToWrite - 4;
        for (var i = 0; i < str.length; ++i) {
          // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
          // See http://unicode.org/faq/utf_bom.html#utf16-3
          var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
          if (codeUnit >= 0xd800 && codeUnit <= 0xdfff) {
            var trailSurrogate = str.charCodeAt(++i);
            codeUnit = (0x10000 + ((codeUnit & 0x3ff) << 10)) | (trailSurrogate & 0x3ff);
          }
          HEAP32[outPtr >> 2] = codeUnit;
          outPtr += 4;
          if (outPtr + 4 > endPtr) break
        }
        // Null-terminate the pointer to the HEAP.
        HEAP32[outPtr >> 2] = 0;
        return outPtr - startPtr
      };

      var lengthBytesUTF32 = (str) => {
        var len = 0;
        for (var i = 0; i < str.length; ++i) {
          // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
          // See http://unicode.org/faq/utf_bom.html#utf16-3
          var codeUnit = str.charCodeAt(i);
          if (codeUnit >= 0xd800 && codeUnit <= 0xdfff) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
          len += 4;
        }

        return len
      };
      var __embind_register_std_wstring = (rawType, charSize, name) => {
        name = readLatin1String(name);
        var decodeString, encodeString, readCharAt, lengthBytesUTF;
        if (charSize === 2) {
          decodeString = UTF16ToString;
          encodeString = stringToUTF16;
          lengthBytesUTF = lengthBytesUTF16;
          readCharAt = (pointer) => HEAPU16[pointer >> 1];
        } else if (charSize === 4) {
          decodeString = UTF32ToString;
          encodeString = stringToUTF32;
          lengthBytesUTF = lengthBytesUTF32;
          readCharAt = (pointer) => HEAPU32[pointer >> 2];
        }
        registerType(rawType, {
          name,
          fromWireType: (value) => {
            // Code mostly taken from _embind_register_std_string fromWireType
            var length = HEAPU32[value >> 2];
            var str;

            var decodeStartPtr = value + 4;
            // Looping here to support possible embedded '0' bytes
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = value + 4 + i * charSize;
              if (i == length || readCharAt(currentBytePtr) == 0) {
                var maxReadBytes = currentBytePtr - decodeStartPtr;
                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                if (str === undefined) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + charSize;
              }
            }

            _free(value);

            return str
          },
          toWireType: (destructors, value) => {
            if (!(typeof value == 'string')) {
              throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
            }

            // assumes POINTER_SIZE alignment
            var length = lengthBytesUTF(value);
            var ptr = _malloc(4 + length + charSize);
            HEAPU32[ptr >> 2] = length / charSize;

            encodeString(value, ptr + 4, length + charSize);

            if (destructors !== null) {
              destructors.push(_free, ptr);
            }
            return ptr
          },
          argPackAdvance: GenericWireTypeSize,
          readValueFromPointer: readPointer,
          destructorFunction(ptr) {
            _free(ptr);
          },
        });
      };

      var __embind_register_void = (rawType, name) => {
        name = readLatin1String(name);
        registerType(rawType, {
          isVoid: true, // void return values can be optimized out sometimes
          name,
          argPackAdvance: 0,
          fromWireType: () => undefined,
          // TODO: assert if anything else is given?
          toWireType: (destructors, o) => undefined,
        });
      };

      var __emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);

      var convertI32PairToI53Checked = (lo, hi) => {
        return (hi + 0x200000) >>> 0 < 0x400001 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN
      };
      function __gmtime_js(time_low, time_high, tmPtr) {
        var time = convertI32PairToI53Checked(time_low, time_high);

        var date = new Date(time * 1000);
        HEAP32[tmPtr >> 2] = date.getUTCSeconds();
        HEAP32[(tmPtr + 4) >> 2] = date.getUTCMinutes();
        HEAP32[(tmPtr + 8) >> 2] = date.getUTCHours();
        HEAP32[(tmPtr + 12) >> 2] = date.getUTCDate();
        HEAP32[(tmPtr + 16) >> 2] = date.getUTCMonth();
        HEAP32[(tmPtr + 20) >> 2] = date.getUTCFullYear() - 1900;
        HEAP32[(tmPtr + 24) >> 2] = date.getUTCDay();
        var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
        var yday = ((date.getTime() - start) / (1000 * 60 * 60 * 24)) | 0;
        HEAP32[(tmPtr + 28) >> 2] = yday;
      }

      var __tzset_js = (timezone, daylight, std_name, dst_name) => {
        // TODO: Use (malleable) environment variables instead of system settings.
        var currentYear = new Date().getFullYear();
        var winter = new Date(currentYear, 0, 1);
        var summer = new Date(currentYear, 6, 1);
        var winterOffset = winter.getTimezoneOffset();
        var summerOffset = summer.getTimezoneOffset();

        // Local standard timezone offset. Local standard time is not adjusted for
        // daylight savings.  This code uses the fact that getTimezoneOffset returns
        // a greater value during Standard Time versus Daylight Saving Time (DST).
        // Thus it determines the expected output during Standard Time, and it
        // compares whether the output of the given date the same (Standard) or less
        // (DST).
        var stdTimezoneOffset = Math.max(winterOffset, summerOffset);

        // timezone is specified as seconds west of UTC ("The external variable
        // `timezone` shall be set to the difference, in seconds, between
        // Coordinated Universal Time (UTC) and local standard time."), the same
        // as returned by stdTimezoneOffset.
        // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
        HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;

        HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);

        var extractZone = (date) =>
          date.toLocaleTimeString(undefined, { hour12: false, timeZoneName: 'short' }).split(' ')[1];
        var winterName = extractZone(winter);
        var summerName = extractZone(summer);
        if (summerOffset < winterOffset) {
          // Northern hemisphere
          stringToUTF8(winterName, std_name, 17);
          stringToUTF8(summerName, dst_name, 17);
        } else {
          stringToUTF8(winterName, dst_name, 17);
          stringToUTF8(summerName, std_name, 17);
        }
      };

      var _emscripten_date_now = () => Date.now();

      var getHeapMax = () =>
        // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
        // full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
        // for any code that deals with heap sizes, which would require special
        // casing all heap size related code to treat 0 specially.
        2147483648;

      var growMemory = (size) => {
        var b = wasmMemory.buffer;
        var pages = (size - b.byteLength + 65535) / 65536;
        try {
          // round size grow request up to wasm page size (fixed 64KB per spec)
          wasmMemory.grow(pages); // .grow() takes a delta compared to the previous size
          updateMemoryViews();
          return 1 /*success*/
        } catch (e) {}
        // implicit 0 return to save code size (caller will cast "undefined" into 0
        // anyhow)
      };
      var _emscripten_resize_heap = (requestedSize) => {
        var oldSize = HEAPU8.length;
        // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
        requestedSize >>>= 0;
        // With multithreaded builds, races can happen (another thread might increase the size
        // in between), so return a failure, and let the caller retry.

        // Memory resize rules:
        // 1.  Always increase heap size to at least the requested size, rounded up
        //     to next page multiple.
        // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
        //     geometrically: increase the heap size according to
        //     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
        //     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
        // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
        //     linearly: increase the heap size by at least
        //     MEMORY_GROWTH_LINEAR_STEP bytes.
        // 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
        //     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
        // 4.  If we were unable to allocate as much memory, it may be due to
        //     over-eager decision to excessively reserve due to (3) above.
        //     Hence if an allocation fails, cut down on the amount of excess
        //     growth, in an attempt to succeed to perform a smaller allocation.

        // A limit is set for how much we can grow. We should not exceed that
        // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
        var maxHeapSize = getHeapMax();
        if (requestedSize > maxHeapSize) {
          return false
        }

        var alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);

        // Loop through potential heap size increases. If we attempt a too eager
        // reservation that fails, cut down on the attempted size and reserve a
        // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
        for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
          var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown); // ensure geometric growth
          // but limit overreserving (default to capping at +96MB overgrowth at most)
          overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);

          var newSize = Math.min(
            maxHeapSize,
            alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
          );

          var replacement = growMemory(newSize);
          if (replacement) {
            return true
          }
        }
        return false
      };

      var ENV = {};

      var getExecutableName = () => {
        return thisProgram
      };
      var getEnvStrings = () => {
        if (!getEnvStrings.strings) {
          // Default values.
          // Browser language detection #8751
          var lang =
            (
              (typeof navigator == 'object' && navigator.languages && navigator.languages[0]) ||
              'C'
            ).replace('-', '_') + '.UTF-8';
          var env = {
            USER: 'web_user',
            LOGNAME: 'web_user',
            PATH: '/',
            PWD: '/',
            HOME: '/home/web_user',
            LANG: lang,
            _: getExecutableName(),
          };
          // Apply the user-provided values, if any.
          for (var x in ENV) {
            // x is a key in ENV; if ENV[x] is undefined, that means it was
            // explicitly set to be so. We allow user code to do that to
            // force variables with default values to remain unset.
            if (ENV[x] === undefined) delete env[x];
            else env[x] = ENV[x];
          }
          var strings = [];
          for (var x in env) {
            strings.push(`${x}=${env[x]}`);
          }
          getEnvStrings.strings = strings;
        }
        return getEnvStrings.strings
      };

      var stringToAscii = (str, buffer) => {
        for (var i = 0; i < str.length; ++i) {
          HEAP8[buffer++] = str.charCodeAt(i);
        }
        // Null-terminate the string
        HEAP8[buffer] = 0;
      };
      var _environ_get = (__environ, environ_buf) => {
        var bufSize = 0;
        getEnvStrings().forEach((string, i) => {
          var ptr = environ_buf + bufSize;
          HEAPU32[(__environ + i * 4) >> 2] = ptr;
          stringToAscii(string, ptr);
          bufSize += string.length + 1;
        });
        return 0
      };

      var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
        var strings = getEnvStrings();
        HEAPU32[penviron_count >> 2] = strings.length;
        var bufSize = 0;
        strings.forEach((string) => (bufSize += string.length + 1));
        HEAPU32[penviron_buf_size >> 2] = bufSize;
        return 0
      };

      var isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

      var arraySum = (array, index) => {
        var sum = 0;
        for (var i = 0; i <= index; sum += array[i++]) {
          // no-op
        }
        return sum
      };

      var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      var MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var addDays = (date, days) => {
        var newDate = new Date(date.getTime());
        while (days > 0) {
          var leap = isLeapYear(newDate.getFullYear());
          var currentMonth = newDate.getMonth();
          var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];

          if (days > daysInCurrentMonth - newDate.getDate()) {
            // we spill over to next month
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
              newDate.setMonth(currentMonth + 1);
            } else {
              newDate.setMonth(0);
              newDate.setFullYear(newDate.getFullYear() + 1);
            }
          } else {
            // we stay in current month
            newDate.setDate(newDate.getDate() + days);
            return newDate
          }
        }

        return newDate
      };

      /** @type {function(string, boolean=, number=)} */
      function intArrayFromString(stringy, dontAddNull, length) {
        var len = lengthBytesUTF8(stringy) + 1;
        var u8array = new Array(len);
        stringToUTF8Array(stringy, u8array, 0, u8array.length);
        return u8array
      }

      var writeArrayToMemory = (array, buffer) => {
        HEAP8.set(array, buffer);
      };

      var _strftime = (s, maxsize, format, tm) => {
        // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
        // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html

        var tm_zone = HEAPU32[(tm + 40) >> 2];

        var date = {
          tm_sec: HEAP32[tm >> 2],
          tm_min: HEAP32[(tm + 4) >> 2],
          tm_hour: HEAP32[(tm + 8) >> 2],
          tm_mday: HEAP32[(tm + 12) >> 2],
          tm_mon: HEAP32[(tm + 16) >> 2],
          tm_year: HEAP32[(tm + 20) >> 2],
          tm_wday: HEAP32[(tm + 24) >> 2],
          tm_yday: HEAP32[(tm + 28) >> 2],
          tm_isdst: HEAP32[(tm + 32) >> 2],
          tm_gmtoff: HEAP32[(tm + 36) >> 2],
          tm_zone: tm_zone ? UTF8ToString(tm_zone) : '',
        };

        var pattern = UTF8ToString(format);

        // expand format
        var EXPANSION_RULES_1 = {
          '%c': '%a %b %d %H:%M:%S %Y', // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
          '%D': '%m/%d/%y', // Equivalent to %m / %d / %y
          '%F': '%Y-%m-%d', // Equivalent to %Y - %m - %d
          '%h': '%b', // Equivalent to %b
          '%r': '%I:%M:%S %p', // Replaced by the time in a.m. and p.m. notation
          '%R': '%H:%M', // Replaced by the time in 24-hour notation
          '%T': '%H:%M:%S', // Replaced by the time
          '%x': '%m/%d/%y', // Replaced by the locale's appropriate date representation
          '%X': '%H:%M:%S', // Replaced by the locale's appropriate time representation
          // Modified Conversion Specifiers
          '%Ec': '%c', // Replaced by the locale's alternative appropriate date and time representation.
          '%EC': '%C', // Replaced by the name of the base year (period) in the locale's alternative representation.
          '%Ex': '%m/%d/%y', // Replaced by the locale's alternative date representation.
          '%EX': '%H:%M:%S', // Replaced by the locale's alternative time representation.
          '%Ey': '%y', // Replaced by the offset from %EC (year only) in the locale's alternative representation.
          '%EY': '%Y', // Replaced by the full alternative year representation.
          '%Od': '%d', // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading zeros if there is any alternative symbol for zero; otherwise, with leading <space> characters.
          '%Oe': '%e', // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading <space> characters.
          '%OH': '%H', // Replaced by the hour (24-hour clock) using the locale's alternative numeric symbols.
          '%OI': '%I', // Replaced by the hour (12-hour clock) using the locale's alternative numeric symbols.
          '%Om': '%m', // Replaced by the month using the locale's alternative numeric symbols.
          '%OM': '%M', // Replaced by the minutes using the locale's alternative numeric symbols.
          '%OS': '%S', // Replaced by the seconds using the locale's alternative numeric symbols.
          '%Ou': '%u', // Replaced by the weekday as a number in the locale's alternative representation (Monday=1).
          '%OU': '%U', // Replaced by the week number of the year (Sunday as the first day of the week, rules corresponding to %U ) using the locale's alternative numeric symbols.
          '%OV': '%V', // Replaced by the week number of the year (Monday as the first day of the week, rules corresponding to %V ) using the locale's alternative numeric symbols.
          '%Ow': '%w', // Replaced by the number of the weekday (Sunday=0) using the locale's alternative numeric symbols.
          '%OW': '%W', // Replaced by the week number of the year (Monday as the first day of the week) using the locale's alternative numeric symbols.
          '%Oy': '%y', // Replaced by the year (offset from %C ) using the locale's alternative numeric symbols.
        };
        for (var rule in EXPANSION_RULES_1) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
        }

        var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var MONTHS = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];

        function leadingSomething(value, digits, character) {
          var str = typeof value == 'number' ? value.toString() : value || '';
          while (str.length < digits) {
            str = character[0] + str;
          }
          return str
        }

        function leadingNulls(value, digits) {
          return leadingSomething(value, digits, '0')
        }

        function compareByDay(date1, date2) {
          function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0
          }

          var compare;
          if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
              compare = sgn(date1.getDate() - date2.getDate());
            }
          }
          return compare
        }

        function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear() - 1, 11, 29)
            case 1: // Monday
              return janFourth
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3)
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2)
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1)
            case 5: // Friday
              return new Date(janFourth.getFullYear() - 1, 11, 31)
            case 6: // Saturday
              return new Date(janFourth.getFullYear() - 1, 11, 30)
          }
        }

        function getWeekBasedYear(date) {
          var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);

          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);

          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);

          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear() + 1
            }
            return thisDate.getFullYear()
          }
          return thisDate.getFullYear() - 1
        }

        var EXPANSION_RULES_2 = {
          '%a': (date) => WEEKDAYS[date.tm_wday].substring(0, 3),
          '%A': (date) => WEEKDAYS[date.tm_wday],
          '%b': (date) => MONTHS[date.tm_mon].substring(0, 3),
          '%B': (date) => MONTHS[date.tm_mon],
          '%C': (date) => {
            var year = date.tm_year + 1900;
            return leadingNulls((year / 100) | 0, 2)
          },
          '%d': (date) => leadingNulls(date.tm_mday, 2),
          '%e': (date) => leadingSomething(date.tm_mday, 2, ' '),
          '%g': (date) => {
            // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year.
            // In this system, weeks begin on a Monday and week 1 of the year is the week that includes
            // January 4th, which is also the week that includes the first Thursday of the year, and
            // is also the first week that contains at least four days in the year.
            // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of
            // the last week of the preceding year; thus, for Saturday 2nd January 1999,
            // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th,
            // or 31st is a Monday, it and any following days are part of week 1 of the following year.
            // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.

            return getWeekBasedYear(date).toString().substring(2)
          },
          '%G': getWeekBasedYear,
          '%H': (date) => leadingNulls(date.tm_hour, 2),
          '%I': (date) => {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0) twelveHour = 12;
            else if (twelveHour > 12) twelveHour -= 12;
            return leadingNulls(twelveHour, 2)
          },
          '%j': (date) => {
            // Day of the year (001-366)
            return leadingNulls(
              date.tm_mday +
                arraySum(
                  isLeapYear(date.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR,
                  date.tm_mon - 1
                ),
              3
            )
          },
          '%m': (date) => leadingNulls(date.tm_mon + 1, 2),
          '%M': (date) => leadingNulls(date.tm_min, 2),
          '%n': () => '\n',
          '%p': (date) => {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
              return 'AM'
            }
            return 'PM'
          },
          '%S': (date) => leadingNulls(date.tm_sec, 2),
          '%t': () => '\t',
          '%u': (date) => date.tm_wday || 7,
          '%U': (date) => {
            var days = date.tm_yday + 7 - date.tm_wday;
            return leadingNulls(Math.floor(days / 7), 2)
          },
          '%V': (date) => {
            // Replaced by the week number of the year (Monday as the first day of the week)
            // as a decimal number [01,53]. If the week containing 1 January has four
            // or more days in the new year, then it is considered week 1.
            // Otherwise, it is the last week of the previous year, and the next week is week 1.
            // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
            var val = Math.floor((date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7);
            // If 1 Jan is just 1-3 days past Monday, the previous week
            // is also in this year.
            if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
              val++;
            }
            if (!val) {
              val = 52;
              // If 31 December of prev year a Thursday, or Friday of a
              // leap year, then the prev year has 53 weeks.
              var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
              if (dec31 == 4 || (dec31 == 5 && isLeapYear((date.tm_year % 400) - 1))) {
                val++;
              }
            } else if (val == 53) {
              // If 1 January is not a Thursday, and not a Wednesday of a
              // leap year, then this year has only 52 weeks.
              var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
              if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
            }
            return leadingNulls(val, 2)
          },
          '%w': (date) => date.tm_wday,
          '%W': (date) => {
            var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
            return leadingNulls(Math.floor(days / 7), 2)
          },
          '%y': (date) => {
            // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
            return (date.tm_year + 1900).toString().substring(2)
          },
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          '%Y': (date) => date.tm_year + 1900,
          '%z': (date) => {
            // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ).
            // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich).
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            // convert from minutes into hhmm format (which means 60 minutes = 100 units)
            off = (off / 60) * 100 + (off % 60);
            return (ahead ? '+' : '-') + String('0000' + off).slice(-4)
          },
          '%Z': (date) => date.tm_zone,
          '%%': () => '%',
        };

        // Replace %% with a pair of NULLs (which cannot occur in a C string), then
        // re-inject them after processing.
        pattern = pattern.replace(/%%/g, '\0\0');
        for (var rule in EXPANSION_RULES_2) {
          if (pattern.includes(rule)) {
            pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
          }
        }
        pattern = pattern.replace(/\0\0/g, '%');

        var bytes = intArrayFromString(pattern);
        if (bytes.length > maxsize) {
          return 0
        }

        writeArrayToMemory(bytes, s);
        return bytes.length - 1
      };
      var _strftime_l = (s, maxsize, format, tm, loc) => {
        return _strftime(s, maxsize, format, tm) // no locale support yet
      };
      embind_init_charCodes();
      BindingError = Module['BindingError'] = class BindingError extends Error {
        constructor(message) {
          super(message);
          this.name = 'BindingError';
        }
      };
      InternalError = Module['InternalError'] = class InternalError extends Error {
        constructor(message) {
          super(message);
          this.name = 'InternalError';
        }
      };
      init_ClassHandle();
      init_embind();
      init_RegisteredPointer();
      UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');
      init_emval();
      var wasmImports = {
        /** @export */
        _abort_js: __abort_js,
        /** @export */
        _embind_register_bigint: __embind_register_bigint,
        /** @export */
        _embind_register_bool: __embind_register_bool,
        /** @export */
        _embind_register_class: __embind_register_class,
        /** @export */
        _embind_register_class_constructor: __embind_register_class_constructor,
        /** @export */
        _embind_register_class_function: __embind_register_class_function,
        /** @export */
        _embind_register_emval: __embind_register_emval,
        /** @export */
        _embind_register_float: __embind_register_float,
        /** @export */
        _embind_register_integer: __embind_register_integer,
        /** @export */
        _embind_register_memory_view: __embind_register_memory_view,
        /** @export */
        _embind_register_std_string: __embind_register_std_string,
        /** @export */
        _embind_register_std_wstring: __embind_register_std_wstring,
        /** @export */
        _embind_register_void: __embind_register_void,
        /** @export */
        _emscripten_memcpy_js: __emscripten_memcpy_js,
        /** @export */
        _gmtime_js: __gmtime_js,
        /** @export */
        _tzset_js: __tzset_js,
        /** @export */
        emscripten_date_now: _emscripten_date_now,
        /** @export */
        emscripten_resize_heap: _emscripten_resize_heap,
        /** @export */
        environ_get: _environ_get,
        /** @export */
        environ_sizes_get: _environ_sizes_get,
        /** @export */
        strftime_l: _strftime_l,
      };
      var wasmExports = createWasm();
      var ___getTypeName = (a0) => (___getTypeName = wasmExports['__getTypeName'])(a0);
      var _malloc = (a0) => (_malloc = wasmExports['malloc'])(a0);
      var _free = (a0) => (_free = wasmExports['free'])(a0);
      (Module['dynCall_iiijj'] = (a0, a1, a2, a3, a4, a5, a6) =>
        (Module['dynCall_iiijj'] = wasmExports['dynCall_iiijj'])(
          a0,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6
        ));
      (Module['dynCall_viijii'] = (a0, a1, a2, a3, a4, a5, a6) =>
        (Module['dynCall_viijii'] = wasmExports['dynCall_viijii'])(
          a0,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6
        ));
      (Module['dynCall_iiiiij'] = (a0, a1, a2, a3, a4, a5, a6) =>
        (Module['dynCall_iiiiij'] = wasmExports['dynCall_iiiiij'])(
          a0,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6
        ));
      (Module['dynCall_iiiiijj'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8) =>
        (Module['dynCall_iiiiijj'] = wasmExports['dynCall_iiiiijj'])(
          a0,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8
        ));
      (Module['dynCall_iiiiiijj'] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) =>
        (Module['dynCall_iiiiiijj'] = wasmExports['dynCall_iiiiiijj'])(
          a0,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7,
          a8,
          a9
        ));

      // include: postamble.js
      // === Auto-generated postamble setup entry stuff ===

      var calledRun;

      dependenciesFulfilled = function runCaller() {
        // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
        if (!calledRun) run();
        if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
      };

      function run() {
        if (runDependencies > 0) {
          return
        }

        preRun();

        // a preRun added a dependency, run will be called later
        if (runDependencies > 0) {
          return
        }

        function doRun() {
          // run may have just been called through dependencies being fulfilled just in this very frame,
          // or while the async setStatus time below was happening
          if (calledRun) return
          calledRun = true;
          Module['calledRun'] = true;

          if (ABORT) return

          initRuntime();

          readyPromiseResolve(Module);

          postRun();
        }

        {
          doRun();
        }
      }

      run();

      // end include: postamble.js

      // include: postamble_modularize.js
      // In MODULARIZE mode we wrap the generated code in a factory function
      // and return either the Module itself, or a promise of the module.
      //
      // We assign to the `moduleRtn` global here and configure closure to see
      // this as and extern so it won't get minified.

      moduleRtn = readyPromise;

      // end include: postamble_modularize.js

      return moduleRtn
    }
  })();

  const _excluded = ["locateFile"];
  const noopPrint = () => {
    // No-op
  };
  function defaultLocateFile(path, prefix) {
    try {
      const url = new URL(prefix);
      if (url.pathname === '/') {
        return "".concat(prefix, "mediainfo.js/dist/").concat(path);
      }
    } catch (_unused) {
      // empty
    }
    return "".concat(prefix, "../").concat(path);
  }

  // TODO pass through more emscripten module options?

  /**
   * Creates a {@link MediaInfo} instance with the specified options.
   *
   * @typeParam TFormat - The format type, defaults to `object`.
   * @param options - Configuration options for creating the {@link MediaInfo} instance.
   * @returns A promise that resolves to a {@link MediaInfo} instance when no callback is provided.
   */

  /**
   * Creates a {@link MediaInfo} instance with the specified options and executes the callback.
   *
   * @typeParam TFormat - The format type, defaults to `object`.
   * @param options - Configuration options for creating the {@link MediaInfo} instance.
   * @param callback - Function to call with the {@link MediaInfo} instance.
   * @param errCallback - Optional function to call on error.
   */

  function mediaInfoFactory() {
    var _options$format;
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let callback = arguments.length > 1 ? arguments[1] : undefined;
    let errCallback = arguments.length > 2 ? arguments[2] : undefined;
    if (callback === undefined) {
      return new Promise((resolve, reject) => {
        mediaInfoFactory(options, resolve, reject);
      });
    }
    const _DEFAULT_OPTIONS$opti = _objectSpread2(_objectSpread2(_objectSpread2({}, DEFAULT_OPTIONS), options), {}, {
        format: (_options$format = options.format) !== null && _options$format !== void 0 ? _options$format : DEFAULT_OPTIONS.format
      }),
      {
        locateFile
      } = _DEFAULT_OPTIONS$opti,
      mergedOptions = _objectWithoutProperties(_DEFAULT_OPTIONS$opti, _excluded);
    const mediaInfoModuleFactoryOpts = {
      // Silence all print in module
      print: noopPrint,
      printErr: noopPrint,
      locateFile: locateFile !== null && locateFile !== void 0 ? locateFile : defaultLocateFile,
      onAbort: err => {
        if (errCallback) {
          errCallback(err);
        }
      }
    };

    // Fetch and load WASM module
    Module(mediaInfoModuleFactoryOpts).then(wasmModule => {
      callback(new MediaInfo(wasmModule, mergedOptions));
    }).catch(error => {
      if (errCallback) {
        errCallback(error);
      }
    });
  }

  /**
   * Checks if a given object is of a specified track type.
   *
   * @template T - The type of track to check for.
   * @param thing - The object to check.
   * @param type - The track type to check against.
   * @returns A boolean indicating whether the object is of the specified track type.
   */
  function isTrackType(thing, type) {
    return thing !== null && typeof thing === 'object' && thing['@type'] === type;
  }

  exports.default = mediaInfoFactory;
  exports.isTrackType = isTrackType;
  exports.mediaInfoFactory = mediaInfoFactory;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
