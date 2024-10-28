/*  ---------------------------------------------------
    Theme Name: Anime
    Description: Anime video tamplate
    Author: Colorib
    Author URI: https://colorib.com/
    Version: 1.0
    Created: Colorib
---------------------------------------------------------  */
'use strict';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyD76IHxR9FkVrAwPwBWbuUNKPy-vNtrC0Q",
    authDomain: "one-piece-br-7a055.firebaseapp.com",
    databaseURL: "https://one-piece-br-7a055-default-rtdb.firebaseio.com",
    projectId: "one-piece-br-7a055",
    storageBucket: "one-piece-br-7a055.appspot.com",
    messagingSenderId: "103698617433",
    appId: "1:103698617433:web:7d6fc2d717db91fbf74d48",
    measurementId: "G-DK62X97LFV"
};

// Sessao Firebase

// Inicializando firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

//pegando referencia da tabela manga
const mangaRef = firebase.database().ref('manga');

//pegando referencia da tabela sbs
const sbsRef = firebase.database().ref('sbs');


// Autenticacao do usuario

// Adicionar um ouvinte de evento para o envio do formulário
async function fazerLogin() {
    // Impede o envio padrão do formulário

    // Obter o valor do campo de email
    const email = document.getElementById("email").value;
    // Obter o valor do campo de senha
    const senha = document.getElementById("senha").value;

    // Faça login usando o Firebase Authentication
    await auth.signInWithEmailAndPassword(email, senha)
        .then((userCredential) => {
            // Login bem-sucedido
            const user = userCredential.user;
            window.location.href = "dashboard.html"
            iniciarTempoSessao();
        })
        .catch((error) => {
            const errorMessage = error.message;
            alert('Ocorreu um erro ao efetuar login!', errorMessage);
        });
};

// Função para desconectar do Firebase (substitua com a lógica real de desconexão)
function desconectarDoFirebase() {
    auth.signOut().then(function () {
        window.location.href = "index.html"

    }).catch(function (error) {
        // Se houver algum erro ao desconectar
        console.error("Erro ao desconectar do Firebase: ", error);
    });
}

// Verifique se o usuário está logado ao acessar a tela /dashboard
function checkUserLogin(urlAtual) {
    auth.onAuthStateChanged(function (user) {
        if (user) {
            if (urlAtual != "dashboard.html") {
                window.location.href = "dashboard.html"
            }
            // O usuário está logado, permita o acesso à tela /dashboard
        }
    });
}

// Função para enviar dados com múltiplas imagens
function enviarDadosComImagens() {
    const numeroCapitulo = document.getElementById('num-cap').value
    const inputImagens = document.getElementById('inputImagens');
    const files = inputImagens.files;

    if (files.length > 0) {
        const imagensPromises = Array.from(files).map((file) => {
            const imagemRef = firebase.storage().ref().child('manga/' + numeroCapitulo + '/' + file.name);

            // Faça o upload da imagem para o Firebase Storage
            return imagemRef.put(file)
                .then((snapshot) => {
                    // Obtenha a URL da imagem após o upload
                    return snapshot.ref.getDownloadURL();
                });
        });

        // Aguarde o upload de todas as imagens
        Promise.all(imagensPromises)
            .then((urls) => {
                // Crie os dados a serem inseridos na tabela
                const dados = {
                    capitulo: numeroCapitulo,
                    titulo: document.getElementById('imput-titulo').value,
                    imagensURL: urls
                };

                // Insira os dados na tabela
                mangaRef.push(dados);
                alert('Dados enviados com sucesso!');
                location.reload();
            })
            .catch((error) => {
                console.error('Erro ao enviar imagens:', error);
            });
    } else {
        console.error('Selecione uma ou mais imagens para enviar.');
    }
}

// Função para enviar dados com múltiplas imagens do sbs
function enviarDadosSbsComImagens() {
    const numeroSbs = document.getElementById('num-sbs').value
    const inputImagens = document.getElementById('inputImagensSbs');
    const files = inputImagens.files;

    if (files.length > 0) {
        const imagensPromises = Array.from(files).map((file) => {
            const imagemRef = firebase.storage().ref().child('sbs/' + numeroSbs + '/' + file.name);

            // Faça o upload da imagem para o Firebase Storage
            return imagemRef.put(file)
                .then((snapshot) => {
                    // Obtenha a URL da imagem após o upload
                    return snapshot.ref.getDownloadURL();
                });
        });

        // Aguarde o upload de todas as imagens
        Promise.all(imagensPromises)
            .then((urls) => {
                // Crie os dados a serem inseridos na tabela
                const dados = {
                    capitulo: numeroSbs,
                    imagensURL: urls
                };

                // Insira os dados na tabela
                sbsRef.push(dados);
                alert('Dados enviados com sucesso!');
                location.reload();
            })
            .catch((error) => {
                console.error('Erro ao enviar imagens:', error);
            });
    } else {
        console.error('Selecione uma ou mais imagens para enviar.');
    }
}

// Função para listar os 3 ultimos capitulos do manga
function listarDadosDoFirebase() {// Elemento HTML onde as imagens serão exibidas


    // Recupera os dados do Firebase
    mangaRef.orderByChild('capitulo').limitToLast(1).on('value', (snapshot) => {
        const dados = snapshot.val();
        // Converter o objeto em um array de objetos
        const arrayDeDados = Object.keys(dados).map((key) => ({
            id: key,
            capitulo: dados[key].capitulo,
            imagemUrl: dados[key].imagensURL[0],
        }));

        // Ordenando os capítulos de forma decrescente
        arrayDeDados.sort((a, b) => b.capitulo - a.capitulo);
        // Verifica se há dados disponíveis
        if (arrayDeDados) {
            // Itera sobre os capítulos e adiciona a primeira imagem de cada capítulo à div
            for (const cap in arrayDeDados) {
                    const imagemUrl = arrayDeDados[cap].imagemUrl
                    const chave = arrayDeDados[cap].id
                    criarHtml(imagemUrl, chave, 'manga');


                
            }
        }
    });

    // Recupera os dados do Firebase
    sbsRef.orderByChild("capitulo").limitToLast(3).on('value', (snapshot) => {
        const dados = snapshot.val();
        // Converter o objeto em um array de objetos
        const arrayDeDados = Object.keys(dados).map((key) => ({
            id: key,
            capitulo: dados[key].capitulo,
            imagemUrl: dados[key].imagensURL[0],
        }));

        // Ordenando os capítulos de forma decrescente
        arrayDeDados.sort((a, b) => b.capitulo - a.capitulo);
        // Verifica se há dados disponíveis
        if (arrayDeDados) {
            // Itera sobre os capítulos e adiciona a primeira imagem de cada capítulo à div
            for (const cap in arrayDeDados) {
                    const imagemUrl = arrayDeDados[cap].imagemUrl
                    const chave = arrayDeDados[cap].id
                    criarHtml(imagemUrl, chave, 'sbs');


                
            }
        }
    });

}



// Função para listar todos os capitulos do manga
async function listarTodosDadosDoFirebase() {// Elemento HTML onde as imagens serão exibidas


    // Recupera os dados do Firebase
    mangaRef.orderByChild('capitulo').on('value', (snapshot) => {
        const dados = snapshot.val();
        // Converter o objeto em um array de objetos
        const arrayDeDados = Object.keys(dados).map((key) => ({
            id: key,
            capitulo: dados[key].capitulo
        }));

        // Ordenando os capítulos de forma decrescente
        arrayDeDados.sort((a, b) => b.capitulo - a.capitulo);
        // Verifica se há dados disponíveis
        if (arrayDeDados) {
            // Itera sobre os capítulos e adiciona a primeira imagem de cada capítulo à div
            for (const cap in arrayDeDados) {
                    const numeroCapitulo = arrayDeDados[cap].capitulo
                    const chave = arrayDeDados[cap].id
                    criarHtmlParaTodosCaps(numeroCapitulo, chave, 'manga');


                
            }
        }
    });

    // Recupera os SBS dados do Firebase
    sbsRef.orderByChild('capitulo').on('value', (snapshot) => {
        const dados = snapshot.val();
        // Converter o objeto em um array de objetos
        const arrayDeDados = Object.keys(dados).map((key) => ({
            id: key,
            capitulo: dados[key].capitulo
        }));

        // Ordenando os capítulos de forma decrescente
        arrayDeDados.sort((a, b) => b.capitulo - a.capitulo);
        // Verifica se há dados disponíveis
        if (arrayDeDados) {
            // Itera sobre os capítulos e adiciona a primeira imagem de cada capítulo à div
            for (const cap in arrayDeDados) {
                    const numeroCapitulo = arrayDeDados[cap].capitulo
                    const chave = arrayDeDados[cap].id
                    criarHtmlParaTodosCaps(numeroCapitulo, chave, 'sbs');


                
            }
        }
    });
}

// Funcao para criar html com a imagem de capa e os botoes para abrir modal para os ultimos capitulos
function criarHtml(primeiraImagemCapitulo, chave, nomeDados) {
    const divRow = nomeDados == 'sbs' ? $('#cards-sbs') : $('#cards-cap');
    const modalName = nomeDados == 'sbs' ? '#sbsModal': '#mangaModal';

    const div = $('<div>').addClass('col-lg-4 col-md-6 col-sm-6');
    const divProductItem = $('<div>').addClass('product__item');
    const cardElement = $('<div>', { 'id': chave }).addClass('product__item__pic set-bg');

    const cardElementCommentA = $('<a>').addClass('primary-btn').text('eng');
    const cardElementComment = $('<div>').addClass('comment');
    cardElementComment.append(cardElementCommentA);


    const cardElementViewA = $('<a>', {
        'type': 'button', 'data-toggle': "modal",
        'data-target': modalName, 'data-dismiss': 'modal', 'data-id': chave
    }).addClass('primary-btn').text('pt');
    const cardElementView = $('<div>').addClass('view');
    cardElementView.append(cardElementViewA)

    cardElement.append(cardElementComment);
    cardElement.append(cardElementView);

    cardElement.css('background-image', 'url(' + primeiraImagemCapitulo + ')');
    divProductItem.append(cardElement);
    div.append(divProductItem)
    divRow.append(div)
}


// Funcao para criar html com a imagem de capa e os botoes para abrir modal para todos
function criarHtmlParaTodosCaps(numeroCapitulo, chaveCap, nomeDiv) {
    const divClassDetails = nomeDiv == 'sbs' ? $('#sbs_all_caps') : $('#manga_all_caps');
    const ModalNome = nomeDiv == 'sbs' ? '#sbsModal' : '#mangaModal';
    const tagA = $('<a>', {
        'type': 'button', 'data-toggle': "modal",
        'data-target': ModalNome, 'data-dismiss': 'modal', 'data-id': chaveCap
    }).text('Cap '+ numeroCapitulo);

    divClassDetails.append(tagA)
}

// Função para iniciar o tempo de sessão
function iniciarTempoSessao() {
    // Define um temporizador para deslogar o usuário após 30 minutos
    setTimeout(() => {
        firebase.auth().signOut().then(() => {
            // Usuário deslogado com sucesso
            console.log('Usuário deslogado após 30 minutos de inatividade');
            window.location.href = 'index.html';
        }).catch((error) => {
            // Tratamento de erro
            console.error('Erro ao deslogar:', error.message);
        });
    }, 30 * 60 * 1000); // 30 minutos em milissegundos
}

// Defina as rotas permitidas
var rotasChecagem = ['login.html', 'dashboard.html'];


(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        /*------------------
            FIlter
        --------------------*/
        $('.filter__controls li').on('click', function () {
            $('.filter__controls li').removeClass('active');
            $(this).addClass('active');
        });
        if ($('.filter__gallery').length > 0) {
            var containerEl = document.querySelector('.filter__gallery');
            var mixer = mixitup(containerEl);
        }
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    // Search model
    $('.search-switch').on('click', function () {
        $('.search-model').fadeIn(400);
    });

    $('.search-close-switch').on('click', function () {
        $('.search-model').fadeOut(400, function () {
            $('#search-input').val('');
        });
    });

    /*------------------
        Navigation
    --------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*------------------
        Hero Slider
    --------------------*/
    var hero_s = $(".hero__slider");
    hero_s.owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: true,
        nav: true,
        navText: ["<span class='arrow_carrot-left'></span>", "<span class='arrow_carrot-right'></span>"],
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        mouseDrag: false
    });

    /*------------------
        Video Player
    --------------------*/
    const player = new Plyr('#player', {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'captions', 'settings', 'fullscreen'],
        seekTime: 25
    });

    /*------------------
        Niceselect
    --------------------*/
    $('select').niceSelect();

    /*------------------
        Scroll To Top
    --------------------*/
    $("#scrollToTopButton").click(function () {
        $("html, body").animate({ scrollTop: 0 }, "slow");
        return false;
    });

})(jQuery);


$(document).ready(function () {

    var currentImageIndex = 0;
    let mangaImages = [];
    let tituloCap = '';
    let numCap = '';

    async function buscarCapituloSelecionado(idCapitulo) {
        const capituloRef = firebase.database().ref('/manga/' + idCapitulo)
        capituloRef.once('value')
            .then((snapshot) => {
                // Dados encontrados
                const dados = snapshot.val();
                mangaImages = dados.imagensURL;
                tituloCap = dados.titulo;
                numCap = dados.capitulo;


                // Aqui você pode realizar ações com os dados recuperados
            })
            .catch((error) => {
                // Tratamento de erro
                console.error('Erro ao buscar dados:', error.message);
            });
    }

    function loadMangaImage() {
        $('#mangaModalLabel').text('Capítulo ' + numCap + ' : ' + tituloCap);
        $('#mangaImage').attr('src', mangaImages[currentImageIndex]);
    }

    $('#mangaModal').on('shown.bs.modal', async function (e) {
        // Obtém o data-id da div clicada
        var dataId = $(e.relatedTarget).data('id');
        await buscarCapituloSelecionado(dataId)
        loadMangaImage();
    });

    $('#mangaModal').on('hidden.bs.modal', function () {
        // Limpar a imagem ao fechar o modal
        $('#mangaImage').attr('src', '');
        currentImageIndex = 0
        tituloCap = '';
        numCap = '';
    });

    $('#mangaModal').click(function () {
        // Fechar o modal ao clicar fora da imagem
        if (event.target === this) {
            // Fecha o modal se o usuário clicar fora da imagem
            $('#mangaModal').modal('hide');
            $('#mangaImage').attr('src', '');
            currentImageIndex = 0
        }
    });

    $(document).keydown(function (e) {
        // Verificar as teclas pressionadas (A e D para navegar, setas para navegar)
        if ($('#mangaModal').is(':visible')) {
            if (e.keyCode === 65) { // Tecla "A" para voltar
                if (currentImageIndex > 0) {
                    currentImageIndex--;
                    loadMangaImage();
                }
            } else if (e.keyCode === 68) { // Tecla "D" para avançar
                if (currentImageIndex < mangaImages.length - 1) {
                    currentImageIndex++;
                    loadMangaImage();
                }
            } else if (e.keyCode === 37) { // Seta esquerda para voltar
                if (currentImageIndex > 0) {
                    currentImageIndex--;
                    loadMangaImage();
                }
            } else if (e.keyCode === 39) { // Seta direita para avançar
                if (currentImageIndex < mangaImages.length - 1) {
                    currentImageIndex++;
                    loadMangaImage();
                }
            }
        }
    });

    $('#mangaImage').click(function (e) {
        var imageWidth = $('#mangaImage').width();
        var clickX = e.pageX - $(this).offset().left;

        if (clickX < imageWidth / 2) {
            // Clicou na parte esquerda da imagem (volta)
            if (currentImageIndex > 0) {
                currentImageIndex--;
                loadMangaImage();
            }
        } else {
            // Clicou na parte direita da imagem (avança)
            if (currentImageIndex < mangaImages.length - 1) {
                currentImageIndex++;
                loadMangaImage();
            }
        }
    });
});



$(document).ready(function () {

    var currentImageIndex = 0;
    let sbsImages = [];
    let tituloCap = '';
    let numCap = '';

    async function buscarCapituloSelecionado(idCapitulo) {
        const capituloRef = firebase.database().ref('/sbs/' + idCapitulo)
        capituloRef.once('value')
            .then((snapshot) => {
                // Dados encontrados
                const dados = snapshot.val();
                sbsImages = dados.imagensURL;
                tituloCap = dados.titulo;
                numCap = dados.capitulo;


                // Aqui você pode realizar ações com os dados recuperados
            })
            .catch((error) => {
                // Tratamento de erro
                console.error('Erro ao buscar dados:', error.message);
            });
    }

    function loadMangaImage() {
        $('#sbsModalLabel').text('SBS vol. ' + numCap);
        $('#sbsImage').attr('src', sbsImages[currentImageIndex]);
    }

    $('#sbsModal').on('shown.bs.modal', async function (e) {
        // Obtém o data-id da div clicada
        var dataId = $(e.relatedTarget).data('id');
        await buscarCapituloSelecionado(dataId)
        loadMangaImage();
    });

    $('#sbsModal').on('hidden.bs.modal', function () {
        // Limpar a imagem ao fechar o modal
        $('#sbsImage').attr('src', '');
        currentImageIndex = 0
        tituloCap = '';
        numCap = '';
    });

    $('#sbsModal').click(function () {
        // Fechar o modal ao clicar fora da imagem
        if (event.target === this) {
            // Fecha o modal se o usuário clicar fora da imagem
            $('#sbsModal').modal('hide');
            $('#sbsImage').attr('src', '');
            currentImageIndex = 0
        }
    });

    $(document).keydown(function (e) {
        // Verificar as teclas pressionadas (A e D para navegar, setas para navegar)
        if ($('#sbsModal').is(':visible')) {
            if (e.keyCode === 65) { // Tecla "A" para voltar
                if (currentImageIndex > 0) {
                    currentImageIndex--;
                    loadMangaImage();
                }
            } else if (e.keyCode === 68) { // Tecla "D" para avançar
                if (currentImageIndex < sbsImages.length - 1) {
                    currentImageIndex++;
                    loadMangaImage();
                }
            } else if (e.keyCode === 37) { // Seta esquerda para voltar
                if (currentImageIndex > 0) {
                    currentImageIndex--;
                    loadMangaImage();
                }
            } else if (e.keyCode === 39) { // Seta direita para avançar
                if (currentImageIndex < sbsImages.length - 1) {
                    currentImageIndex++;
                    loadMangaImage();
                }
            }
        }
    });

    $('#sbsImage').click(function (e) {
        var imageWidth = $('#sbsImage').width();
        var clickX = e.pageX - $(this).offset().left;

        if (clickX < imageWidth / 2) {
            // Clicou na parte esquerda da imagem (volta)
            if (currentImageIndex > 0) {
                currentImageIndex--;
                loadMangaImage();
            }
        } else {
            // Clicou na parte direita da imagem (avança)
            if (currentImageIndex < sbsImages.length - 1) {
                currentImageIndex++;
                loadMangaImage();
            }
        }
    });
});

// Função para lidar com mudanças na URL
function handleHashChange() {
    const urlInput = window.location.pathname.split("/")[6]
    if (urlInput && rotasChecagem && rotasChecagem.includes(urlInput)) {
        checkUserLogin(urlInput);
    }
    if(urlInput == 'lista-manga.html') {
    }

}

function mostrarFormulario(tipo) {
    if (tipo === 'edicao') {
        document.getElementById('formularioEdicao').style.display = 'block';
        document.getElementById('formularioCriacao').style.display = 'none';
    } else if (tipo === 'criacao') {
        document.getElementById('formularioEdicao').style.display = 'none';
        document.getElementById('formularioCriacao').style.display = 'block';
    }
}

function mostrarFormularioSBS(tipo) {
    if (tipo === 'edicao') {
        document.getElementById('formularioEdicao').style.display = 'block';
        document.getElementById('formularioCriacaoSbs').style.display = 'none';
    } else if (tipo === 'criacao') {
        document.getElementById('formularioEdicao').style.display = 'none';
        document.getElementById('formularioCriacaoSbs').style.display = 'block';
    }
}




// Adicionar um ouvinte para o evento hashchange
window.addEventListener('hashchange', handleHashChange());

// Chame a função para listar dados ao carregar a página
window.onload = listarDadosDoFirebase(), 
listarTodosDadosDoFirebase(), carregarComponente();

// Função para carregar o conteúdo do componente em um contêiner
async function carregarComponente() {
    $.get('footer.html', function(data) {
        $('#footerr').html(data);
    })
}