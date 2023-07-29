window.onload = function () {
    if (typeof webkitSpeechRecognition !== 'function') {
        alert('크롬에서만 동작 합니다.');
        return false;
    }
    const recognition = new window.webkitSpeechRecognition();
    var u = new SpeechSynthesisUtterance();
    const language = 'ko-KR';
    // const language = 'en-US';

    const micBtn = document.querySelector('.mic');
    const delBtn = document.querySelector('.remove');
    const resultWrap = document.querySelector('.result');
    const recognizedTextarea = document.querySelector('.recognized-textarea');
    const recording_state = document.querySelector('#recording-state');

    const final_span = document.querySelector('#final_span');
    const interim_span = document.querySelector('#interim_span');

    let isRecognizing = false;
    let ignoreEndProcess = false;
    let finalTranscript = '';

    recognition.continuous = true;
    recognition.interimResults = true;
    const maxRecognitionDuration = 500; // 10 seconds
    // true : recognition이 result의 중간중간을 보고한다

    setTimeout(function () {
        $("#google_translate_element a").click();
        start();
    }, 1000);

    setInterval(function () {
        if (!isRecognizing) {
            start();
        }
    }, 1500);

    $("#intro").click(function () {
        if ($(".base-line").css("display") == "none")
            $(".base-line").fadeIn(1000);
        else
            $(".base-line").fadeOut(500);
    });

    /**
     * 음성 인식 시작 처리
     */
    recognition.onstart = function (event) {
        //console.log('onstart', event);
        isRecognizing = true;
        recording_state.className = 'on';
    };

    /**
     * 음성 인식 종료 처리
     */
    recognition.onend = function () {
        //console.log('onend', arguments);
        isRecognizing = false;
        $("#statusSpan").html("작동중지");
        if (ignoreEndProcess) {
            return false;
        }
        // Do end process
        recording_state.className = 'off';
        console.log('off')
        if (!finalTranscript) {
            // console.log('empty finalTranscript');
            return false;
        }

        setTimeout(() => { start(); }, 1000);
    };
    /**
     * 음성 인식 결과 처리
     * 밑의 코드는 SpeechRecognition 객체의 onresult Property인 이벤트 핸들러를 설정하는 것임.
     * API로부터 성공적으로 result를 받았을 때 밑에서 정의한 SpeechRecognition 객체의 onresult 이벤트가 핸들러가 호출됨.
     */
    recognition.onresult = function (event) {
        // console.log('onresult', event);

        let finalTranscript = '';
        let interimTranscript = '';
        if (typeof event.results === 'undefined') {
            recognition.onend = null;
            recognition.stop();
            return;
        }

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        final_span.innerHTML = finalTranscript;
        interim_span.innerHTML = interimTranscript;
        final_span_Handler();
    };

    /**
     * 음성 인식 에러 처리
     */
    recognition.onerror = function (event) {
        console.log('onerror', event);
        if (event.error.match(/no-speech|audio-capture|not-allowed/)) {
            ignoreEndProcess = true;
        }
        micBtn.classList.add();
        setTimeout(() => { start(); }, 1000);
    };

    /**
     * 음성 인식 트리거
     *  마이크 버튼 눌렀을때
     */
    function start() {
        if (isRecognizing) {
            recognition.stop();
            console.log('stopped');
            return;
        }
        recognition.lang = language;
        recognition.start();
        ignoreEndProcess = false;

        finalTranscript = '';
        final_span.innerHTML = '';
        interim_span.innerHTML = '';
        $("#statusSpan").html("작동중");
    }

    function delBtnHandler() {
        final_span.innerHTML = '';
        _index = 0;
        $("#resultTable").html("");
    }
    /**
     * 초기 바인딩
     */

    function fnResetTime() {
        var _time = new Date();
        $(".resultWord").each(function (idx, _this) {
            var _resultTime = $(_this).data("time");
            const diffMSec = _time.getTime() - _resultTime.getTime();
            var _word = "";
            if (diffMSec > 0 && diffMSec < 1000) {
                _word = "Just Now";
            } else if (diffMSec > 1000 && diffMSec < 60000) {
                _word = Math.round((diffMSec / 1000)) + "Sec";
            } else if (diffMSec > 60000) {
                _word = Math.round((diffMSec / 60000)) + "Min";
            } else {
                _word = "ㅡ";
            }
            $(_this).find(".timer").html(_word);
        });
    }

    async function fnGetPapago(reqs) {
        var _res;

        const item = {
            client: "qRI_iBDYZHUMEGJ9vcMe",
            secret: "20_jR4NqRT",
            source: "ko",
            target: "en",
            query: reqs
        };

        fetch("/Test/Translate", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })
            .then(response => response.json())
            .then((_result) => {
                _res = _result;
            })
            .catch(error => console.error('Error caused : ', error));
        _res = JSON.parse(_res);
        _res = _res.message.result.translatedText;
        return _res;
    }



    const synth = window.speechSynthesis;

    const inputForm = document.querySelector("form");
    const inputTxt = document.querySelector(".txt");
    const voiceSelect = document.querySelector("select");

    const pitch = document.querySelector("#pitch");
    const pitchValue = document.querySelector(".pitch-value");
    const rate = document.querySelector("#rate");
    const rateValue = document.querySelector(".rate-value");

    let voices = [];

    function populateVoiceList() {
        voices = synth.getVoices().sort(function (a, b) {
            const aname = a.name.toUpperCase();
            const bname = b.name.toUpperCase();

            if (aname < bname) {
                return -1;
            } else if (aname == bname) {
                return 0;
            } else {
                return +1;
            }
        });
        const selectedIndex =
            voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
        voiceSelect.innerHTML = "";

        for (let i = 0; i < voices.length; i++) {
            const option = document.createElement("option");
            option.textContent = `${voices[i].name} (${voices[i].lang})`;

            if (voices[i].default) {
                option.textContent += " -- DEFAULT";
            }

            option.setAttribute("data-lang", voices[i].lang);
            option.setAttribute("data-name", voices[i].name);
            voiceSelect.appendChild(option);
        }
        voiceSelect.selectedIndex = selectedIndex;
    }

    populateVoiceList();

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    function speechText(inputTxt) {
        if (synth.speaking) {
            console.error("speechSynthesis.speaking");
            return;
        }
        $("#speech").html(`음성 출력중 / ${inputTxt}`);
        $("#speech").css("color", "red");
        if (inputTxt !== "") {
            const utterThis = new SpeechSynthesisUtterance(inputTxt);

            utterThis.onend = function (event) {
                $("#speech").html("음성 출력 완료");
                $("#speech").css("color", "green");
                setTimeout(function () {
                    $("#speech").html("대기");
                    $("#speech").css("color", "black");
                }, 3000);
                console.log("SpeechSynthesisUtterance.onend");
            };

            utterThis.onerror = function (event) {
                $("#speech").html("음성 출력 에러");
                $("#speech").css("color", "gray");
                console.error("SpeechSynthesisUtterance.onerror");
            };

            const selectedOption =
                voiceSelect.selectedOptions[0].getAttribute("data-name");

            for (let i = 0; i < voices.length; i++) {
                if (voices[i].name === selectedOption) {
                    utterThis.voice = voices[i];
                    break;
                }
            }
            utterThis.pitch = pitch.value;
            utterThis.rate = rate.value;
            synth.speak(utterThis);
        }
    }

    pitch.onchange = function () {
        pitchValue.textContent = pitch.value;
    };

    rate.onchange = function () {
        rateValue.textContent = rate.value;
    };

    function defaultSelect(sel) {
        const el = document.getElementById('select');
        const len = el.options.length;
        for (let i = 0; i < len; i++) {
            if (el.options[i].value == sel) {
                el.options[i].selected = true;
            }
        }
    }


    async function speechText2(_text) {
        u.text = _text;
        u.lang = 'en-US';
        u.rate = 1.0;
        u.onend = function (event) {
            console.log('Finished in ' + event.elapsedTime + ' seconds.');
        }
        speechSynthesis.speak(u);
    }

    var _index = 0;
    async function final_span_Handler() {
        if (final_span.innerHTML) {
            const _time = new Date().toTimeString().split(' ')[0];
            const final_span_text = final_span.innerHTML;
            const final_arr = final_span_text.split(' ');
            _translation = await fnGetPapago(final_span_text);
            console.log(_translation);
            console.log("@await speechText(_translation)@");
            $("#speech").html("음성 출력중");
            $("#speech").css("color", "red");
            await speechText(_translation);
            console.log("@@await speechText(_translation)@@");

            let makeword = `<tr class="resultWord" id="result${_index}"><td class="timer">${_time}</td><td>${final_span_text}<br/>${_translation}</td>`;
            $("#resultTable").append(makeword);
            $(`#result${_index}`).data("time", new Date());
            // 스크롤을 맨 아래로 이동
            let resultContainer = document.querySelector(".result");
            resultContainer.scrollTop = resultContainer.scrollHeight;
            _index++;
            fnResetTime();

        } else {
            return null;
        }
    }
    function initialize() {
        micBtn.addEventListener('click', start);
        delBtn.addEventListener('click', delBtnHandler);
        //마이크 버튼 누르면 시작start
    }

    initialize();
    setTimeout(function () {
        /*
         Google UK English Female (en-GB)
         Google UK English Male (en-GB)
         Google US English (en-US)
         Microsoft Heami - Korean (Korean) (ko-KR) -- DEFAULT
         Google 한국의 (ko-KR)
        Microsoft Alonso Online (Natural) - Spanish (United States) (es-US)
        Microsoft Christopher Online (Natural) - English (United States) (en-US)
        Microsoft Guy Online (Natural) - English (United States) (en-US)
        Microsoft Dmitry Online (Natural) - Russian (Russia) (ru-RU)
        */
        defaultSelect("Microsoft Dmitry Online (Natural) - Russian (Russia) (ru-RU)");
    }, 100);

}