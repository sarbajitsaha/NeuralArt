'use strict';

Vue.component("header-footer", {
    template: `
    <div id="main">
        <nav>
            <div class="nav-wrapper">
                <a href="#" class="title">Neural Art</a>
            </div>
        </nav>
        <slot></slot>
        <footer class="page-footer">
            <div class="container">
                <div class="row">
                    <p class="white-text center-align">Developed By Sarbajit Saha</p>
                </div>
            </div>
        </footer>
    </div>
    `,
});

var resultCheck;

Vue.component("style-image", {
    template: `
        <a @click="postStyle" class="carousel-item" :id="id" href="#">
            <img id="styles" :src="src">
        </a>
    `,
    props: ['id', 'src'],
    methods: {
        postStyle() {
            if (targetImageBase64 == "") {
                Materialize.toast('Upload an image first!', 3000, 'rounded')
            }
            else {
                var body = {
                    'styleId': this.id,
                    'imageBase64Encoded': targetImageBase64.replace(new RegExp("data:image/[a-z]*;base64,", 'i'), ""),
                    'optimizeForPrint': false,
                    'imageSize': 1800
                };
                Materialize.toast('Uploading image', 1000, 'rounded')
                deepArtEffectsClient.uploadPost(null, body)
                    .then(function (result) {
                        Materialize.toast('Image uploaded. Processing image', 1000, 'rounded')
                        let submissionId = result.data.submissionId;
                        resultCheck = setInterval(imageReadyCheck.bind(null, submissionId), 2500);
                    }).catch(function (result) {
                        console.log(result);
                    });
            }
        }
    }
})

function imageReadyCheck(submissionId) {
    let params = {
        submissionId: submissionId,
    };
    deepArtEffectsClient.resultGet(params)
        .then(function (result) {
            console.log(result.data.status);
            if (result.data.status == "finished") {
                Materialize.toast('Processing finished', 1000, 'rounded')
                var preview = document.querySelector('#target-img');
                preview.src = result.data.url;
                clearInterval(resultCheck);
            }
        }).catch(function (result) {
            console.log("Error checking status");
        });
}

var targetImageBase64 = "";

function selectImage() {
    var preview = document.querySelector('#target-img'); //selects the query named img
    var file = document.querySelector("#inp").files[0]; //sames as here
    var reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
        targetImageBase64 = reader.result;
    }

    if (file) {
        reader.readAsDataURL(file); //reads the data as a URL
    } else {
        preview.src = "";
    }
}

function getStyles(arr) {
    Materialize.toast('Loading styles', 2000, 'rounded');
    deepArtEffectsClient.stylesGet()
        .then(function (result) {
            let styles = result.data;
            for (var i = 0, length = styles.length; i < length; i++) {
                let style = {
                    id: styles[i].id,
                    src: styles[i].url
                };
                arr.push(style);
            }
            Materialize.toast('Styles loaded!', 1000, 'rounded');
        }).catch(function (result) {
            console.log(result);
            Materialize.toast('Error in loading styles', 3000, 'rounded');
        });
}

var app = new Vue({
    el: "#root",
    data: {
        styles: []
    },
    methods: {
        uploadImage() {
            document.querySelector("#inp").click();
        },
        downloadImage() {
            document.querySelector("#download-link").href = document.querySelector("#target-img").src;
            document.querySelector("#download-link").click();
        },
    },
    mounted() {
        getStyles(this.styles);
    },
    updated() {
        $('.carousel').carousel({ padding: -80 });
    }
})
