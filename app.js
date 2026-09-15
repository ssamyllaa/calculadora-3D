/* =====================================================
   ATELIE3D
   CALCULADORA DE PRECIFICAÇÃO
===================================================== */


/* =====================================================
   CHAVES DO LOCAL STORAGE
===================================================== */

const CONFIG_KEY = "atelie3d_taxas";

const PRODUTOS_KEY = "atelie3d_produtos";


/* =====================================================
   TAXAS PADRÃO
===================================================== */

const taxasPadrao = [

    {
        id: crypto.randomUUID(),

        nome: "Venda direta",

        percentual: 0,

        fixa: 0,

        ativo: true
    },


    {
        id: crypto.randomUUID(),

        nome: "Shopee",

        percentual: 20,

        fixa: 4,

        ativo: true
    },


    {
        id: crypto.randomUUID(),

        nome: "Mercado Livre",

        percentual: 0,

        fixa: 0,

        ativo: true
    },


    {
        id: crypto.randomUUID(),

        nome: "TikTok Shop",

        percentual: 0,

        fixa: 0,

        ativo: true
    }

];


/* =====================================================
   LOCAL STORAGE
===================================================== */

function carregarTaxas() {

    const dados =
        localStorage.getItem(CONFIG_KEY);


    if (!dados) {

        localStorage.setItem(
            CONFIG_KEY,
            JSON.stringify(taxasPadrao)
        );

        return taxasPadrao;

    }


    return JSON.parse(dados);

}


function salvarTaxas(taxas) {

    localStorage.setItem(
        CONFIG_KEY,
        JSON.stringify(taxas)
    );

}


function carregarProdutos() {

    const dados =
        localStorage.getItem(PRODUTOS_KEY);


    return dados
        ? JSON.parse(dados)
        : [];

}


function salvarProdutos(produtos) {

    localStorage.setItem(
        PRODUTOS_KEY,
        JSON.stringify(produtos)
    );

}


let taxas = carregarTaxas();


/* =====================================================
   ELEMENTOS
===================================================== */

const canalVenda =
    document.getElementById("canalVenda");


/* =====================================================
   FORMATAÇÃO
===================================================== */

function dinheiro(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function numero(id) {

    return Number(
        document.getElementById(id).value
    ) || 0;

}


/* =====================================================
   ATUALIZAR CANAIS
===================================================== */

function atualizarCanais() {

    const canalAtual =
        canalVenda.value;


    canalVenda.innerHTML = "";


    taxas
        .filter(taxa => taxa.ativo)
        .forEach(taxa => {

            const option =
                document.createElement("option");


            option.value =
                taxa.id;


            option.textContent =
                taxa.nome;


            canalVenda.appendChild(option);

        });


    if (
        canalAtual &&
        taxas.some(
            taxa =>
                taxa.id === canalAtual &&
                taxa.ativo
        )
    ) {

        canalVenda.value =
            canalAtual;

    }

}


/* =====================================================
   CÁLCULO PRINCIPAL
===================================================== */

function calcular() {


    /* ===============================================
       FILAMENTO
    =============================================== */

    const gramas =
        numero("filamentoGramas");


    const precoKg =
        numero("filamentoKg");


    const custoFilamento =
        (gramas / 1000) *
        precoKg;



    /* ===============================================
       ENERGIA
    =============================================== */

    const horas =
        numero("tempoImpressao");


    const watts =
        numero("consumoW");


    const custoEnergia =
        (watts / 1000) *
        horas *
        numero("valorKwh");



    /* ===============================================
       MANUTENÇÃO
    =============================================== */

    const custoManutencao =
        horas *
        numero("manutencaoHora");



    /* ===============================================
       MÃO DE OBRA
    =============================================== */

    const custoMaoObra =
        numero("maoObraHora") *
        numero("tempoMaoObra");



    /* ===============================================
       OUTROS CUSTOS
    =============================================== */

    const custoEmbalagem =
        numero("embalagem");


    const custoOutros =
        numero("outrosCustos");



    /* ===============================================
       CUSTO ANTES DAS PERDAS
    =============================================== */

    const custoAntesPerdas =

        custoFilamento +

        custoEnergia +

        custoManutencao +

        custoMaoObra +

        custoEmbalagem +

        custoOutros;



    /* ===============================================
       PERDAS
    =============================================== */

    const custoPerdas =

        custoAntesPerdas *
        (
            numero("perdas") /
            100
        );



    /* ===============================================
       CUSTO TOTAL
    =============================================== */

    const custoTotal =

        custoAntesPerdas +
        custoPerdas;



    /* ===============================================
       CANAL
    =============================================== */

    const canal = taxas.find(

        taxa =>
            taxa.id ===
            canalVenda.value

    );


    const percentual = canal

        ? canal.percentual / 100

        : 0;


    const taxaFixa = canal

        ? canal.fixa

        : 0;



    /* ===============================================
       TIPO DE LUCRO
    =============================================== */

    const tipoLucro =

        document.querySelector(
            'input[name="tipoLucro"]:checked'
        ).value;



    let lucroAlvo;



    if (
        tipoLucro === "percentual"
    ) {

        lucroAlvo =

            custoTotal *
            (
                numero("lucroDesejado") /
                100
            );

    }

    else {

        lucroAlvo =
            numero("lucroDesejado");

    }



    /* ===============================================
       CÁLCULO INVERSO

       PREÇO =
       (CUSTO + LUCRO + TAXA FIXA)
       /
       (1 - TAXA PERCENTUAL)
    =============================================== */

    let precoVenda;


    if (percentual >= 1) {

        precoVenda = 0;

    }

    else {

        precoVenda =

            (
                custoTotal +
                lucroAlvo +
                taxaFixa
            )
            /
            (
                1 -
                percentual
            );

    }



    /* ===============================================
       TAXA DO MARKETPLACE
    =============================================== */

    const valorTaxa =

        (
            precoVenda *
            percentual
        )
        +
        taxaFixa;



    /* ===============================================
       VALOR LÍQUIDO
    =============================================== */

    const valorLiquido =

        precoVenda -
        valorTaxa;



    /* ===============================================
       LUCRO REAL
    =============================================== */

    const lucroReal =

        valorLiquido -
        custoTotal;



    /* ===============================================
       MARGEM
    =============================================== */

    const margem =

        precoVenda > 0

            ? (
                lucroReal /
                precoVenda
            ) * 100

            : 0;



    /* ===============================================
       MOSTRAR RESULTADOS
    =============================================== */

    document.getElementById(
        "precoSugerido"
    ).textContent =
        dinheiro(precoVenda);


    document.getElementById(
        "resultadoFilamento"
    ).textContent =
        dinheiro(custoFilamento);


    document.getElementById(
        "resultadoEnergia"
    ).textContent =
        dinheiro(custoEnergia);


    document.getElementById(
        "resultadoManutencao"
    ).textContent =
        dinheiro(custoManutencao);


    document.getElementById(
        "resultadoMaoObra"
    ).textContent =
        dinheiro(custoMaoObra);


    document.getElementById(
        "resultadoEmbalagem"
    ).textContent =
        dinheiro(custoEmbalagem);


    document.getElementById(
        "resultadoOutros"
    ).textContent =
        dinheiro(custoOutros);


    document.getElementById(
        "resultadoPerdas"
    ).textContent =
        dinheiro(custoPerdas);


    document.getElementById(
        "resultadoTaxa"
    ).textContent =
        dinheiro(valorTaxa);


    document.getElementById(
        "resultadoCustoTotal"
    ).textContent =
        dinheiro(custoTotal);


    document.getElementById(
        "resultadoLiquido"
    ).textContent =
        dinheiro(valorLiquido);


    document.getElementById(
        "resultadoLucro"
    ).textContent =
        dinheiro(lucroReal);


    document.getElementById(
        "resultadoMargem"
    ).textContent =
        margem.toFixed(2) + "%";



    /* ===============================================
       RETORNO
    =============================================== */

    return {

        precoVenda,

        custoTotal,

        valorTaxa,

        valorLiquido,

        lucroReal,

        margem,

        custoFilamento,

        custoEnergia,

        custoManutencao,

        custoMaoObra,

        custoEmbalagem,

        custoOutros,

        custoPerdas,

        canal:
            canal
                ? canal.nome
                : "Venda direta"

    };

}


/* =====================================================
   ATUALIZAÇÃO AUTOMÁTICA
===================================================== */

document.querySelectorAll(
    "#calculadora input, #calculadora select"
).forEach(elemento => {

    elemento.addEventListener(
        "input",
        calcular
    );


    elemento.addEventListener(
        "change",
        calcular
    );

});


/* =====================================================
   TIPO DE LUCRO
===================================================== */

document.querySelectorAll(
    'input[name="tipoLucro"]'
).forEach(radio => {

    radio.addEventListener(
        "change",
        () => {

            const label =
                document.getElementById(
                    "labelLucro"
                );


            if (
                radio.value ===
                "percentual"
            ) {

                label.textContent =
                    "Lucro desejado (%)";

            }

            else {

                label.textContent =
                    "Lucro desejado (R$)";

            }


            calcular();

        }
    );

});


/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const listaMarketplaces =
    document.getElementById(
        "listaMarketplaces"
    );


function renderizarMarketplaces() {

    listaMarketplaces.innerHTML = "";


    taxas.forEach(taxa => {

        const div =
            document.createElement("div");


        div.className =
            "marketplace";


        div.innerHTML = `

            <div class="marketplace-name">

                <strong>
                    ${taxa.nome}
                </strong>

                <span>
                    Configure as taxas deste canal
                </span>

            </div>


            <div>

                <label>
                    Percentual (%)
                </label>

                <input
                    type="number"
                    value="${taxa.percentual}"
                    min="0"
                    step="0.01"
                    data-percentual="${taxa.id}"
                >

            </div>


            <div>

                <label>
                    Taxa fixa (R$)
                </label>

                <input
                    type="number"
                    value="${taxa.fixa}"
                    min="0"
                    step="0.01"
                    data-fixa="${taxa.id}"
                >

            </div>


            <button
                class="delete-btn"
                data-delete="${taxa.id}"
            >
                Excluir
            </button>

        `;


        listaMarketplaces.appendChild(div);

    });


    adicionarEventosTaxas();

}


/* =====================================================
   EVENTOS DAS TAXAS
===================================================== */

function adicionarEventosTaxas() {


    document.querySelectorAll(
        "[data-percentual]"
    ).forEach(input => {

        input.addEventListener(
            "input",
            () => {

                const id =
                    input.dataset.percentual;


                const taxa =
                    taxas.find(
                        t => t.id === id
                    );


                if (!taxa) return;


                taxa.percentual =
                    Number(input.value) || 0;


                salvarTaxas(taxas);


                calcular();

            }
        );

    });



    document.querySelectorAll(
        "[data-fixa]"
    ).forEach(input => {

        input.addEventListener(
            "input",
            () => {

                const id =
                    input.dataset.fixa;


                const taxa =
                    taxas.find(
                        t => t.id === id
                    );


                if (!taxa) return;


                taxa.fixa =
                    Number(input.value) || 0;


                salvarTaxas(taxas);


                calcular();

            }
        );

    });



    document.querySelectorAll(
        "[data-delete]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const id =
                    button.dataset.delete;


                const taxa =
                    taxas.find(
                        t => t.id === id
                    );


                if (!taxa) return;


                const confirmar =
                    confirm(
                        `Deseja excluir "${taxa.nome}"?`
                    );


                if (!confirmar) return;


                taxas =
                    taxas.filter(
                        t =>
                            t.id !== id
                    );


                salvarTaxas(taxas);


                atualizarCanais();


                renderizarMarketplaces();


                calcular();

            }
        );

    });

}


/* =====================================================
   MODAL
===================================================== */

const modal =
    document.getElementById(
        "modalMarketplace"
    );


document.getElementById(
    "adicionarMarketplace"
).addEventListener(
    "click",
    () => {

        modal.classList.add(
            "active"
        );

    }
);


function fecharModal() {

    modal.classList.remove(
        "active"
    );

}


document.getElementById(
    "fecharModal"
).addEventListener(
    "click",
    fecharModal
);


document.getElementById(
    "cancelarMarketplace"
).addEventListener(
    "click",
    fecharModal
);


/* =====================================================
   SALVAR MARKETPLACE
===================================================== */

document.getElementById(
    "salvarMarketplace"
).addEventListener(
    "click",
    () => {

        const nome =

            document.getElementById(
                "novoMarketplaceNome"
            )
            .value
            .trim();


        const percentual =

            Number(
                document.getElementById(
                    "novoMarketplacePercentual"
                ).value
            ) || 0;


        const fixa =

            Number(
                document.getElementById(
                    "novoMarketplaceFixa"
                ).value
            ) || 0;



        if (!nome) {

            alert(
                "Digite o nome do marketplace."
            );

            return;

        }



        taxas.push({

            id:
                crypto.randomUUID(),

            nome,

            percentual,

            fixa,

            ativo: true

        });



        salvarTaxas(taxas);


        atualizarCanais();


        renderizarMarketplaces();


        fecharModal();


        document.getElementById(
            "novoMarketplaceNome"
        ).value = "";


        document.getElementById(
            "novoMarketplacePercentual"
        ).value = 0;


        document.getElementById(
            "novoMarketplaceFixa"
        ).value = 0;


        calcular();

    }
);


/* =====================================================
   PRODUTOS
===================================================== */

function renderizarProdutos() {

    const lista =
        document.getElementById(
            "listaProdutos"
        );


    const produtos =
        carregarProdutos();


    lista.innerHTML = "";


    if (
        produtos.length === 0
    ) {

        lista.innerHTML = `

            <div class="card">

                <h2>
                    Nenhum produto salvo
                </h2>

                <p>
                    Faça uma precificação
                    e clique em
                    "Adicionar como produto".
                </p>

            </div>

        `;

        return;

    }



    produtos.forEach(produto => {

        const div =
            document.createElement(
                "div"
            );


        div.className =
            "product-card";


        div.innerHTML = `

            <h3>
                ${produto.nome}
            </h3>


            <div class="product-price">

                ${dinheiro(
                    produto.preco
                )}

            </div>


            <div class="product-info">

                <div>
                    Canal:
                    ${produto.canal}
                </div>

                <div>
                    Custo:
                    ${dinheiro(
                        produto.custo
                    )}
                </div>

                <div>
                    Taxa:
                    ${dinheiro(
                        produto.taxa
                    )}
                </div>

                <div>
                    Valor líquido:
                    ${dinheiro(
                        produto.liquido
                    )}
                </div>

                <div>
                    Lucro:
                    ${dinheiro(
                        produto.lucro
                    )}
                </div>

                <div>
                    Margem:
                    ${produto.margem.toFixed(2)}%
                </div>

            </div>


            <button
                class="product-delete"
                data-produto="${produto.id}"
            >
                Excluir
            </button>

        `;


        lista.appendChild(div);

    });



    document.querySelectorAll(
        "[data-produto]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const id =
                    button.dataset.produto;


                let produtos =
                    carregarProdutos();


                produtos =
                    produtos.filter(
                        produto =>
                            produto.id !== id
                    );


                salvarProdutos(
                    produtos
                );


                renderizarProdutos();

            }
        );

    });

}


/* =====================================================
   ADICIONAR COMO PRODUTO
===================================================== */

const botaoAdicionarProduto =
    document.getElementById("adicionarComoProduto");


botaoAdicionarProduto.addEventListener(
    "click",
    () => {

        // Faz o cálculo atual
        const resultado = calcular();


        // Pede o nome
        const nome = prompt(
            "Digite o nome do produto:"
        );


        // Se cancelar ou deixar vazio
        if (!nome || !nome.trim()) {
            return;
        }


        // Carrega produtos já existentes
        const produtos = carregarProdutos();


        // Cria o novo produto
        const novoProduto = {

            id: crypto.randomUUID(),

            nome: nome.trim(),

            preco: Number(
                resultado.precoVenda
            ),

            custo: Number(
                resultado.custoTotal
            ),

            taxa: Number(
                resultado.valorTaxa
            ),

            liquido: Number(
                resultado.valorLiquido
            ),

            lucro: Number(
                resultado.lucroReal
            ),

            margem: Number(
                resultado.margem
            ),

            canal: resultado.canal,

            custos: {

                filamento: Number(
                    resultado.custoFilamento
                ),

                energia: Number(
                    resultado.custoEnergia
                ),

                manutencao: Number(
                    resultado.custoManutencao
                ),

                maoObra: Number(
                    resultado.custoMaoObra
                ),

                embalagem: Number(
                    resultado.custoEmbalagem
                ),

                outros: Number(
                    resultado.custoOutros
                ),

                perdas: Number(
                    resultado.custoPerdas
                )

            },

            data: new Date().toISOString()

        };


        // Adiciona o produto na lista
        produtos.push(novoProduto);


        // Salva no navegador
        salvarProdutos(produtos);


        // Atualiza a tela de produtos
        renderizarProdutos();


        // Abre automaticamente a aba Produtos
        document.querySelectorAll(
            ".menu-btn"
        ).forEach(btn => {

            btn.classList.remove("active");

        });


        document
            .querySelector(
                '.menu-btn[data-page="produtos"]'
            )
            .classList.add("active");


        document.querySelectorAll(
            ".page"
        ).forEach(page => {

            page.classList.remove("active");

        });


        document
            .getElementById("produtos")
            .classList.add("active");


        // Confirmação
        alert(
            `"${nome.trim()}" foi adicionado aos produtos com sucesso!`
        );

    }
);

/* =====================================================
   MENU
===================================================== */

document.querySelectorAll(
    ".menu-btn"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.page;


            document.querySelectorAll(
                ".menu-btn"
            ).forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            document.querySelectorAll(
                ".page"
            ).forEach(secao => {

                secao.classList.remove(
                    "active"
                );

            });


            document.getElementById(
                page
            ).classList.add(
                "active"
            );


            if (
                page === "produtos"
            ) {

                renderizarProdutos();

            }


            if (
                page === "configuracoes"
            ) {

                renderizarMarketplaces();

            }

        }
    );

});


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

atualizarCanais();

renderizarMarketplaces();

renderizarProdutos();

calcular();