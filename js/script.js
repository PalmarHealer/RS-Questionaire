let selectedCards = [];
$(document).ready(function() {

    let targetX = 0, targetY = 0, cardData = {};

    // Hide footer on intro screen; will show when selection starts
    $("#bottomBar").hide();

    // Intro/start screen
    $("#btnStart").on("click", function() {
        $("#start-screen").hide();
        $("#step-0").show();
        $("#bottomBar").show();
    });

    // Info before tournament
    $("#btnStartTournament").on("click", function() {
        $("#info-compare").hide();
        $("#step-1").show();
        $("#progress").show();
        startTournament();
    });

    // Final info before results
    $("#btnShowResults").on("click", function() {
        $("#info-finale").hide();
        showRanking();
    });

    $.getJSON("./static/cards.json", function(data) {
        let mainContainer = $("#step-0");

        // Durch die Kategorien iterieren (als einklappbare Gruppen)
        $.each(data.categories, function(categoryId, categoryName) {
            let group = $('<section>').addClass('category-group').attr('id', 'category-' + categoryId);
            let header = $(`
                <button type="button" class="category-header" aria-expanded="true">
                    <span class="category-title">${categoryName}</span>
                    <i class="fa-solid fa-chevron-down chevron" aria-hidden="true"></i>
                </button>
            `);
            let body = $('<div class="category-body"></div>');
            let categoryDiv = $('<div class="cards"></div>');

            categoryDiv.on('mousemove', function(e) {
                targetX = e.clientX;
                targetY = e.clientY;
            });

            // Filtern der Bedürfnisse für diese Kategorie
            let needsInCategory = data.needs.filter(need => need.category === categoryId);

            $.each(needsInCategory, function(idx, need) {
                let cardElement = createInitialCards(need);
                cardData[need.id] = need; // Falls cardData genutzt wird
                categoryDiv.append(cardElement);
            });

            body.append(categoryDiv);

            header.on('click', function() {
                const $btn = $(this);
                // Prevent rapid toggling spam by adding a short cooldown
                if ($btn.data('cooldown')) return;
                $btn.data('cooldown', true);

                // Stop ongoing animations to avoid queueing, then toggle
                body.stop(true, true).slideToggle(150);
                group.toggleClass('collapsed');
                let expanded = $btn.attr('aria-expanded') === 'true';
                $btn.attr('aria-expanded', (!expanded).toString());

                // Release cooldown shortly after the animation ends
                setTimeout(function() { $btn.data('cooldown', false); }, 220);
            });

            group.append(header, body);
            mainContainer.append(group);
        });
        console.log(cardData);
    }).fail(function() {
        console.error("Fehler beim Laden der JSON-Datei.");
    });


    let matches = [];
    let currentMatchIndex = 0;
    let scores = {};

    $("#nextStep").on("click", function() {
        $('#step-0').hide();
        $('#bottomBar').hide();
        $('#info-compare').show();
        $('#progress').hide();
        $('#btnSavePDF, #btnRestart').hide();
    });

    $("#btnSavePDF").on("click", function() { window.print(); });
    $("#btnRestart").on("click", function() { location.reload(); });

    function startTournament() {
        matches = generateMatchups(selectedCards);
        currentMatchIndex = 0;
        scores = {};

        selectedCards.forEach(id => scores[id] = 0);
        showNextMatch();
    }

    function generateMatchups(cards) {
        let matchups = [];
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                matchups.push([cards[i], cards[j]]);
            }
        }
        return matchups;
    }

    function showNextMatch() {
        updateProgress();
        if (currentMatchIndex >= matches.length) {
            showFinalInfo();
            return;
        }

        let [card1Id, card2Id] = matches[currentMatchIndex];
        let card1 = cardData[card1Id];
        let card2 = cardData[card2Id];

        $("#matchContainer").html(`
            <h2>Wähle, was dir wichtiger ist</h2>
            <div class="match">
                <div class="card" onclick="selectWinner(${card1Id})">
                    <div class="card-content">
                        <div class="card-info">
                            <i class="${card1.icon}"></i>
                            <div class="card-info-title">
                                <h3>${card1.name}</h3>
                                <h4>${card1.description}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="vs">VS</span>
                <div class="card" onclick="selectWinner(${card2Id})">
                    <div class="card-content">
                        <div class="card-info">
                            <i class="${card2.icon}"></i>
                            <div class="card-info-title">
                                <h3>${card2.name}</h3>
                                <h4>${card2.description}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    window.selectWinner = function(winnerId) {
        scores[winnerId]++;
        currentMatchIndex++;
        showNextMatch();
    }

    function updateProgress() {
        let totalMatches = matches.length;
        let completedMatches = currentMatchIndex;
        let percentage = (completedMatches / totalMatches) * 100;

        // Update text: "x / y"
        $("#progress-text").text(`${completedMatches} / ${totalMatches}`);

        // Update progress bar
        $("#progress-bar").css("width", `${percentage}%`);
    }

    function showFinalInfo() {
        $("#progress").hide();
        $("#step-1").hide();
        $("#info-finale").show();
        $("#bottomBar").hide();
    }

    function showRanking() {
        $("#progress").hide();
        $("#step-1").show();
        $("#bottomBar").show();
        $("#nextStep").hide();
        $("#btnSavePDF, #btnRestart").show();
        let ranking = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .map(([id, score]) => {
                let card = cardData[id];
                let relativeScore = (score / matches.length) * 100;
                let relativeScoreRounded = Math.round(relativeScore * 10) / 10;
                return `<div class="card noClick">
                            <div class="fill" style="width: ${relativeScore}%"></div>
                            <div class="card-content">
                                    <div class="card-info">
                                        <i class="${card.icon}"></i>
                                        <div class="card-info-title">
                                            <h3>${card.name} ${relativeScoreRounded}%</h3>
                                            <h4>${card.description}</h4>
                                        </div>
                                </div>
                            </div>
                        </div>`;
            })
            .join("");

        $("#matchContainer").html(`<h2>Dein Ergebnis</h2>${ranking}`);
    }
});

function onCardClick(thisCard) {
    let card = $(thisCard);
    card.toggleClass("selected");

    if (card.hasClass("selected")) {
        selectedCards.push(card.attr("id"));
    } else {
        selectedCards = selectedCards.filter(item => item !== card.attr("id"));
    }
    $("#nextStep").toggleClass("show", selectedCards.length >= 3).prop("disabled", selectedCards.length < 3);
}
function createInitialCards(card) {
    return $(`
        <div class="card" id="${card.id}" onclick="onCardClick(this)">
            <div class="card-content">
                    <div class="card-info">
                        <i class="${card.icon}"></i>
                        <div class="card-info-title">
                            <h3>${card.name}</h3>
                            <h4>${card.description}</h4>
                        </div>
                </div>
            </div>
        </div>
    `);
}
