$(document).ready(function() {

    let targetX = 0, targetY = 0, selectedCards = [], cardData = {};

    $.getJSON("./static/cards.json", function(data) {
        let mainContainer = $("#step-0");

        $.each(data.categories, function(category, cards) {
            let stepContainer = $("<div>").attr("id", category);
            let categoryTitle = $("<h2>").text(category);
            stepContainer.append(categoryTitle);
            let categoryDiv = $("<div>").addClass("cards");

            categoryDiv.on("mousemove", function(e) {
                targetX = e.clientX;
                targetY = e.clientY;
            })

            $.each(cards, function(index, card) {
                let cardElement = createInitialCards(card);

                cardElement.on("click", function() {
                    onCardClick($(this), card);
                });

                cardData[card.id] = card;
                categoryDiv.append(cardElement);
            });

            stepContainer.append(categoryDiv);
            mainContainer.prepend(stepContainer);
        });
    }).fail(function() {
        console.error("Fehler beim Laden der JSON-Datei.");
    });

    setInterval(function() {
        $(".card").each(function() {
            const rect = this.getBoundingClientRect(),
                x = targetX - rect.left,
                y = targetY - rect.top;

            let currentX = parseFloat($(this).css("--mouse-x")) || x;
            let currentY = parseFloat($(this).css("--mouse-y")) || y;

            currentX += (x - currentX) / 10;
            currentY += (y - currentY) / 10;

            $(this).css("--mouse-x", `${currentX}px`);
            $(this).css("--mouse-y", `${currentY}px`);
        });
    }, 16); // 16ms for 60FPS

    function onCardClick(thisCard, card) {
        thisCard.toggleClass("selected");
        let id = card.id;

        if (thisCard.hasClass("selected")) {
            selectedCards.push(id);
        } else {
            selectedCards = selectedCards.filter(cardId => cardId !== id);
        }

        $("#nextStep").toggleClass("show", selectedCards.length >= 3);

    }











    let matches = [];
    let currentMatchIndex = 0;
    let scores = {};

    $("#nextStep").on("click", function() {
        startTournament();
        $('#step-0').hide();
        $('#step-1').show();
        $('#progress').show();
    });

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
            showRanking();
            return;
        }

        let [card1Id, card2Id] = matches[currentMatchIndex];
        let card1 = cardData[card1Id];
        let card2 = cardData[card2Id];

        $("#matchContainer").html(`
            <div class="match">
                <div class="card" onclick="selectWinner('${card1Id}')">
                    <h3>${card1.name}</h3>
                    <p>${card1.description}</p>
                </div>
                <div class="vs">VS</div>
                <div class="card" onclick="selectWinner('${card2Id}')">
                    <h3>${card2.name}</h3>
                    <p>${card2.description}</p>
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

    function showRanking() {
        let ranking = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .map(([id, score]) => {
                let card = cardData[id];
                return `<li><strong>${card.name}</strong>: ${score} Punkte</li>`;
            })
            .join("");

        $("#matchContainer").html(`<h2>Ranking</h2><ul>${ranking}</ul>`);
    }
















});
function createInitialCards(card) {
    return $(`
        <div class="card" id="${card.id}">
            <div class="card-content">
                <div class="card-image">
                    <i class="${card.icon}"></i>
                </div>
                <div class="card-info-wrapper">
                    <div class="card-info">
                        <i class="${card.icon}"></i>
                        <div class="card-info-title">
                            <h3>${card.name}</h3>
                            <h4>${card.description}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
}
