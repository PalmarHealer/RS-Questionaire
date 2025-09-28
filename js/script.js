let selectedCards = [];
$(document).ready(function() {

    // About modal interactions
    const $aboutModal = $('#aboutModal');
    const openAbout = function(){
        $aboutModal.addClass('open').attr('aria-hidden','false');
        const $content = $aboutModal.find('.modal-content');
        $content.attr('tabindex','-1').focus();
    };
    const closeAbout = function(){
        $aboutModal.removeClass('open').attr('aria-hidden','true');
    };
    $('#aboutTrigger').on('click', openAbout);
    $aboutModal.on('click', function(e){
        if($(e.target).is('.modal-backdrop') || $(e.target).is('.modal-close')){
            closeAbout();
        }
    });
    $(document).on('keydown', function(e){ if(e.key === 'Escape' && $aboutModal.hasClass('open')) closeAbout(); });

    // Configurable milestone prompts shown during Vergleiche
    const milestonePrompts = [
        { percent: 66, text: 'Du hast bereits zwei Drittel der Vergleiche geschafft - weiter so!' },
        { percent: 80, text: 'Nur noch wenige Vergleiche - gleich ist dein Ranking fertig!' }
    ];
    milestonePrompts.sort((a, b) => a.percent - b.percent);
    const seenMilestones = new Set();
    let activeMilestoneText = '';

    const root = document.documentElement;
    const computedStyles = getComputedStyle(root);
    const selectionLimits = { min: 3, max: 20 };
    const baseTextColor = (computedStyles.getPropertyValue('--color-text') || '#0f1111').trim() || '#0f1111';
    const selectionPalette = {
        danger: {
            accent: (computedStyles.getPropertyValue('--selection-danger') || '#d94c3f').trim() || '#d94c3f',
            contrast: baseTextColor
        },
        warning: {
            accent: (computedStyles.getPropertyValue('--selection-warning') || '#d88c17').trim() || '#d88c17',
            contrast: baseTextColor
        },
        success: {
            accent: (computedStyles.getPropertyValue('--selection-success') || '#139a43').trim() || '#139a43',
            contrast: baseTextColor
        }
    };
    const selectionMessages = {
        belowMin: 'Wähle mindestens 3 Karten aus.',
        readyLow: 'Bereit? Starte den Vergleich.',
        readyMid: 'Starker Mix! Du kannst direkt starten.',
        readyHigh: 'Optional: Du kannst bis zu 20 Karten wählen.',
        tooMany: 'Bitte höchstens 20 Karten auswählen.'
    };

    const $topBar = $('#topBar');
    const $duelProgress = $('#progress');
    const $selectionProgress = $('#selectionProgress');
    const $selectionProgressContainer = $('#selection-progress-container');
    const $selectionProgressBar = $('#selection-progress-bar');
    const $selectionProgressLabel = $('#selection-progress-label');
    const $selectHint = $('#selectHint');
    const $nextStep = $('#nextStep');

    function selectionStateForCount(count) {
        if (count > selectionLimits.max) {
            return { palette: selectionPalette.danger, isEnabled: false, message: selectionMessages.tooMany };
        }
        if (count >= 15) {
            return { palette: selectionPalette.warning, isEnabled: true, message: selectionMessages.readyHigh };
        }
        if (count >= 8) {
            return { palette: selectionPalette.success, isEnabled: true, message: selectionMessages.readyMid };
        }
        if (count >= selectionLimits.min) {
            return { palette: selectionPalette.warning, isEnabled: true, message: selectionMessages.readyLow };
        }
        return { palette: selectionPalette.danger, isEnabled: false, message: selectionMessages.belowMin };
    }

    function updateSelectionIndicators() {
        const count = selectedCards.length;
        const state = selectionStateForCount(count);
        const palette = state.palette || selectionPalette.warning;
        const inSelectionPhase = $('#step-0').is(':visible');

        root.style.setProperty('--selection-accent', palette.accent);

        if ($selectionProgressBar.length && $selectionProgressContainer.length) {
            const cappedCount = Math.max(0, Math.min(count, selectionLimits.max));
            const ratio = selectionLimits.max ? (cappedCount / selectionLimits.max) : 0;
            const widthPercent = Math.max(0, Math.min(ratio * 100, 100));
            $selectionProgressBar.css({
                width: `${Math.round(widthPercent * 10) / 10}%`,
                background: palette.accent
            });
            $selectionProgressContainer.attr({
                'aria-valuenow': cappedCount,
                'aria-valuetext': `${count} von ${selectionLimits.max}`
            });
        }

        if ($selectionProgressLabel.length) {
            const parts = [`${count} / ${selectionLimits.max}`];
            if (state.message) {
                parts.push(state.message);
            }
            $selectionProgressLabel.text(parts.join(' \u00b7 '));
        }

        if ($selectionProgress.length) {
            $selectionProgress.attr('data-selection-state', state.isEnabled ? 'ready' : 'blocked');
            if (inSelectionPhase) {
                $selectionProgress.css('display', 'flex').attr('aria-hidden', 'false');
            } else {
                $selectionProgress.css('display', 'none').attr('aria-hidden', 'true');
            }
        }

        if (state.isEnabled) {
            $nextStep.addClass('show').prop('disabled', false);
        } else {
            $nextStep.removeClass('show').prop('disabled', true);
        }

        if ($selectHint.length) {
            $selectHint.hide();
        }
    }

    window.updateSelectionIndicators = updateSelectionIndicators;
    updateSelectionIndicators();


    let targetX = 0, targetY = 0, cardData = {};

    // Hide footer on intro screen; will show when selection starts
    $("#bottomBar").hide();
    $("#aboutTrigger").hide();

    // Intro/start screen
    $("#btnStart").on("click", function() {
        $("#start-screen").hide();
        $("#step-0").show();
        $("#bottomBar").show();
        $topBar.addClass('is-active selection-active');
        $duelProgress.hide();
        $selectionProgress.css('display', 'flex').attr('aria-hidden', 'false');
        if ($selectHint.length) {
            $selectHint.hide();
        }
        updateSelectionIndicators();
    });

    // Info before tournament
    $("#btnStartTournament").on("click", function() {
        $("#info-compare").hide();
        $("#step-1").show();
        $duelProgress.show();
        $topBar.addClass('is-active').removeClass('selection-active');
        $selectionProgress.css('display', 'none').attr('aria-hidden', 'true');
        $("#aboutTrigger").hide();
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

    $nextStep.on("click", function() {
        $('#step-0').hide();
        $('#bottomBar').hide();
        $('#info-compare').show();
        $duelProgress.hide();
        $topBar.removeClass('is-active selection-active');
        $selectionProgress.css('display', 'none').attr('aria-hidden', 'true');
        $('#btnSavePDF, #btnRestart, #aboutTrigger').hide();
        if ($selectHint.length) {
            $selectHint.hide();
        }
    });

    $("#btnSavePDF").on("click", function() { window.print(); });
    $("#btnRestart").on("click", function() { location.reload(); });

    function startTournament() {
        matches = generateMatchups(selectedCards);
        currentMatchIndex = 0;
        scores = {};
        seenMilestones.clear();
        activeMilestoneText = '';

        selectedCards.forEach(function(id) { scores[id] = 0; });
        showNextMatch();
    }

    function evaluateMilestones(percentage) {
        if (!Number.isFinite(percentage)) {
            return;
        }
        let updatedText = activeMilestoneText;
        milestonePrompts.forEach(function(milestone) {
            if (percentage >= milestone.percent && !seenMilestones.has(milestone.percent)) {
                seenMilestones.add(milestone.percent);
                updatedText = milestone.text;
            }
        });
        if (updatedText !== activeMilestoneText) {
            activeMilestoneText = updatedText;
        }
    }

    function renderMilestoneMessage() {
        const $message = $('#milestoneMessage');
        if (!$message.length) {
            return;
        }
        if (activeMilestoneText) {
            $message.text(activeMilestoneText).addClass('is-visible');
        } else {
            $message.text('').removeClass('is-visible');
        }
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
        const percentage = updateProgress();
        evaluateMilestones(percentage);
        if (currentMatchIndex >= matches.length) {
            showFinalInfo();
            return;
        }

        const [card1Id, card2Id] = matches[currentMatchIndex];
        const card1 = cardData[card1Id];
        const card2 = cardData[card2Id];

        $("#matchContainer").html(`
            <h2>Wähle, was dir wichtiger ist</h2>
            <p id="milestoneMessage" class="milestone-message"></p>
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

        renderMilestoneMessage();
    }

    window.selectWinner = function(winnerId) {
        scores[winnerId]++;
        currentMatchIndex++;
        showNextMatch();
    }

    function updateProgress() {
        const totalMatches = matches.length;
        const completedMatches = currentMatchIndex;
        const percentage = totalMatches ? (completedMatches / totalMatches) * 100 : 0;

        $("#progress-text").text(`${completedMatches} / ${totalMatches}`);
        $("#progress-bar").css("width", `${percentage}%`);

        return percentage;
    }

    function showFinalInfo() {
        $duelProgress.hide();
        $topBar.removeClass('is-active selection-active');
        $selectionProgress.css('display', 'none').attr('aria-hidden', 'true');
        $("#step-1").hide();
        $("#info-finale").show();
        $("#bottomBar").hide();
        $("#aboutTrigger").hide();
        if ($selectHint.length) {
            $selectHint.hide();
        }
    }

    function showRanking() {
        $duelProgress.hide();
        $topBar.removeClass('is-active selection-active');
        $selectionProgress.css('display', 'none').attr('aria-hidden', 'true');
        $("#step-1").show();
        $("#bottomBar").show();
        if ($selectHint.length) {
            $selectHint.hide();
        }
        $nextStep.hide();
        $("#btnSavePDF, #btnRestart").show();
        $("#aboutTrigger").show();
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

        $("#matchContainer").html(`<h2>Dein Ergebnis</h2><p class="result-note">Speichere dein Ranking als PDF oder starte einen neuen Durchgang.</p>${ranking}`);
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
    if (typeof window.updateSelectionIndicators === 'function') {
        window.updateSelectionIndicators();
    }
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
