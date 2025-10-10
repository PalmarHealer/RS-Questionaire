let selectedCards = [];

(function ($) {
'use strict';

$(function () {
    const TEST_DEFINITIONS = [
        { id: 'needs', path: './static/cards-beduerfnisse.json' },
        { id: 'values', path: './static/cards-werte.json' }
    ];

    const fallbackMilestones = [
        { percent: 66, text: 'Du hast bereits zwei Drittel der Vergleiche geschafft – weiter so!' },
        { percent: 80, text: 'Nur noch wenige Vergleiche – gleich ist dein Ranking fertig!' }
    ];

    const root = document.documentElement;
    const computedStyles = getComputedStyle(root);
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

    const defaultSelectionMessages = {
        belowMin: 'Wähle mindestens 3 Karten aus.',
        readyLow: 'Bereit? Starte den Vergleich.',
        readyMid: 'Starker Mix! Du kannst direkt starten.',
        readyHigh: 'Optional: Du kannst bis zu 20 Karten wählen.',
        tooMany: 'Bitte höchstens 20 Karten auswählen.'
    };

    const testConfigs = {};
    let activeTestId = null;
    let activeTestConfig = null;
    let selectionLimits = { min: 3, max: 20 };
    let selectionMessages = $.extend({}, defaultSelectionMessages);
    let milestonePrompts = fallbackMilestones.slice();
    const seenMilestones = new Set();
    let activeMilestoneText = '';
    let cardData = {};
    let matches = [];
    let currentMatchIndex = 0;
    let scores = {};

    const $startScreen = $('#start-screen');
    const $startTitle = $('#start-screen-title');
    const $startSubtitle = $('#start-screen-subtitle');
    const $btnStart = $('#btnStart');
    const $infoCompare = $('#info-compare');
    const $compareTitle = $('#compare-screen-title');
    const $compareSubtitle = $('#compare-screen-subtitle');
    const $btnStartTournament = $('#btnStartTournament');
    const $infoFinale = $('#info-finale');
    const $finalTitle = $('#final-screen-title');
    const $finalSubtitle = $('#final-screen-subtitle');
    const $btnShowResults = $('#btnShowResults');
    const $selectHint = $('#selectHint');
    const $selectionProgress = $('#selectionProgress');
    const $selectionProgressContainer = $('#selection-progress-container');
    const $selectionProgressBar = $('#selection-progress-bar');
    const $selectionProgressLabel = $('#selection-progress-label');
    const $topBar = $('#topBar');
    const $duelProgress = $('#progress');
    const $nextStep = $('#nextStep');
    const $cardsStep = $('#step-0');
    const $matchStep = $('#step-1');
    const $matchContainer = $('#matchContainer');
    const $bottomBar = $('#bottomBar');
    const $btnSavePDF = $('#btnSavePDF');
    const $btnRestart = $('#btnRestart');
    const $aboutTrigger = $('#aboutTrigger');
    const $startScreenInfo = $('#start-screen-info');

    $bottomBar.hide();
    $aboutTrigger.hide();

    // Check for URL parameters on page load
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Auto-load quiz from URL parameter
    const quizParam = getUrlParameter('quiz');
    if (quizParam) {
        const definition = definitionById(quizParam);
        if (definition) {
            loadTestDefinition(quizParam, null);
        }
    }

    $matchContainer.on('click', '.match .card', function () {
        const cardId = $(this).data('card-id');
        if (cardId !== undefined) {
            window.selectWinner(cardId);
        }
    });

    $btnStart.on('click', function () {
        if (!activeTestConfig) {
            return;
        }
        $startScreen.hide();
        $cardsStep.show();
        $bottomBar.show();
        $topBar.addClass('is-active selection-active');
        $duelProgress.hide();
        $selectionProgress.css('display', 'flex').attr('aria-hidden', 'false');
        $selectHint.hide();
        updateSelectionIndicators();
    });

    $btnStartTournament.on('click', function () {
        $infoCompare.hide();
        $matchStep.show();
        $duelProgress.show();
        $topBar.addClass('is-active').removeClass('selection-active');
        $selectionProgress.css('display', 'none').attr('aria-hidden', 'true');
        $aboutTrigger.hide();
        startTournament();
    });

    $btnShowResults.on('click', function () {
        $infoFinale.hide();
        showRanking();
    });

    $nextStep.on('click', function () {
        $cardsStep.hide();
        $bottomBar.hide();
        $infoCompare.show();
        $duelProgress.hide();
        $topBar.removeClass('is-active selection-active');
        $selectionProgress.css('display', 'none').attr('aria-hidden', 'true');
        $btnSavePDF.hide();
        $btnRestart.hide();
        $aboutTrigger.hide();
        $selectHint.hide();
    });

    $btnSavePDF.on('click', function () {
        window.print();
    });

    $btnRestart.on('click', function () {
        location.reload();
    });

    // Modal functionality
    const $aboutModal = $('#aboutModal');
    $aboutTrigger.on('click', function () {
        $aboutModal.css('display', 'flex').attr('aria-hidden', 'false');
        $aboutModal.find('.modal-content').focus();
    });

    $aboutModal.on('click', '.modal-close, .modal-backdrop', function () {
        $aboutModal.css('display', 'none').attr('aria-hidden', 'true');
    });

    // Prevent closing when clicking inside modal content
    $aboutModal.on('click', '.modal-content', function (e) {
        e.stopPropagation();
    });

    function definitionById(testId) {
        return TEST_DEFINITIONS.find(function (definition) {
            return definition.id === testId;
        }) || null;
    }

    function loadTestDefinition(testId, $trigger) {
        let definition = definitionById(testId);
        const loadedFromUrl = true;
        if (!definition) {
            return;
        }
        const cached = testConfigs[testId];
        if (cached) {
            activateTest(testId, cached, loadedFromUrl);
            return;
        }
        $.getJSON(definition.path).done(function (data) {
            if (typeof data !== 'object' || data === null) {
                return;
            }
            data.id = definition.id;
            data.path = definition.path;
            testConfigs[testId] = data;
            activateTest(testId, data, loadedFromUrl);
        }).fail(function () {
            // Silent fail
        });
    }

    function activateTest(testId, config, showInfo) {
        activeTestId = testId;
        activeTestConfig = config;
        applyTestConfig(config);

        // Show info section if loaded from URL parameter
        if (showInfo) {
            $startScreenInfo.show();
        } else {
            $startScreenInfo.hide();
        }

        $startScreen.show();
    }

    function applyTestConfig(config) {
        const selectionConfig = config.selection || {};
        const limits = selectionConfig.limits || {};
        selectionLimits = {
            min: typeof limits.min === 'number' ? limits.min : parseInt(limits.min, 10) || 3,
            max: typeof limits.max === 'number' ? limits.max : parseInt(limits.max, 10) || 20
        };
        selectionMessages = $.extend({}, defaultSelectionMessages, selectionConfig.messages || {});

        const screens = config.screens || {};
        const startScreen = screens.start || {};
        const compareScreen = screens.compare || {};
        const finaleScreen = screens.finale || {};

        $startTitle.text(startScreen.title || 'Willkommen!');
        $startSubtitle.html(startScreen.subtitle || '');
        $btnStart.text(startScreen.cta || 'Auswahl starten');

        $compareTitle.text(compareScreen.title || 'Jetzt geht\'s los');
        $compareSubtitle.html(compareScreen.subtitle || '');
        $btnStartTournament.text(compareScreen.cta || 'Vergleiche starten');

        $finalTitle.text(finaleScreen.title || 'Geschafft!');
        $finalSubtitle.html(finaleScreen.subtitle || '');
        $btnShowResults.text(finaleScreen.cta || 'Ergebnis anzeigen');

        const flow = config.flow || {};
        $nextStep.text(flow.nextButton || 'Weiter');
        $btnSavePDF.text(flow.saveButton || 'PDF speichern');
        $btnRestart.text(flow.restartButton || 'Neu starten');

        const hintText = selectionConfig.hint || '';
        if (hintText) {
            $selectHint.text(hintText).hide();
        } else {
            $selectHint.text('').hide();
        }

        milestonePrompts = Array.isArray((config.tournament || {}).milestones)
            ? (config.tournament || {}).milestones.slice()
            : fallbackMilestones.slice();
        milestonePrompts.sort(function (a, b) {
            return (a.percent || 0) - (b.percent || 0);
        });
        seenMilestones.clear();
        activeMilestoneText = '';

        cardData = {};
        selectedCards = [];
        matches = [];
        currentMatchIndex = 0;
        scores = {};

        renderSelectionCards(Array.isArray(config.cards) ? config.cards : []);
        updateSelectionIndicators();
        $selectionProgressBar.css({ width: '0%' });
        $selectionProgress.attr('data-selection-state', 'blocked');
    }

    function renderSelectionCards(cards) {
        const wrapper = $('<div class="cards"></div>');
        cards.forEach(function (card) {
            const id = String(card.id);
            const normalizedCard = $.extend({}, card, { id: id });
            cardData[id] = normalizedCard;
            wrapper.append(createInitialCards(normalizedCard));
        });
        $cardsStep.empty().append(wrapper);
    }

    function selectionStateForCount(count) {
        if (count > selectionLimits.max) {
            return { palette: selectionPalette.danger, isEnabled: false, message: selectionMessages.tooMany };
        }
        if (count >= Math.max(selectionLimits.max - 5, selectionLimits.min + 5)) {
            return { palette: selectionPalette.warning, isEnabled: true, message: selectionMessages.readyHigh };
        }
        if (count >= selectionLimits.min + 3) {
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
        const inSelectionPhase = $cardsStep.is(':visible');

        root.style.setProperty('--selection-accent', palette.accent);

        if ($selectionProgressBar.length) {
            const cappedCount = Math.max(0, Math.min(count, selectionLimits.max));
            const ratio = selectionLimits.max ? (cappedCount / selectionLimits.max) : 0;
            const widthPercent = Math.max(0, Math.min(ratio * 100, 100));
            $selectionProgressBar.css({
                width: widthPercent.toFixed(1) + '%',
                background: palette.accent
            });
            $selectionProgressContainer.attr({
                'aria-valuenow': cappedCount,
                'aria-valuetext': count + ' von ' + selectionLimits.max
            });
        }

        if ($selectionProgressLabel.length) {
            const parts = [count + ' / ' + selectionLimits.max];
            if (state.message) {
                parts.push(state.message);
            }
            $selectionProgressLabel.text(parts.join(' · '));
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

        $selectHint.hide();
    }

    window.updateSelectionIndicators = updateSelectionIndicators;

    function startTournament() {
        matches = generateMatchups(selectedCards);
        currentMatchIndex = 0;
        scores = {};
        seenMilestones.clear();
        activeMilestoneText = '';

        selectedCards.forEach(function (id) {
            scores[id] = 0;
        });
        showNextMatch();
    }

    function evaluateMilestones(percentage) {
        if (!Number.isFinite(percentage)) {
            return;
        }
        let updatedText = activeMilestoneText;
        milestonePrompts.forEach(function (milestone) {
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

    function showNextMatch() {
        const percentage = updateProgress();
        evaluateMilestones(percentage);
        if (currentMatchIndex >= matches.length) {
            showFinalInfo();
            return;
        }

        const pair = matches[currentMatchIndex];
        const card1Id = pair[0];
        const card2Id = pair[1];
        const card1 = cardData[card1Id];
        const card2 = cardData[card2Id];
        const tournamentTitle = (activeTestConfig && activeTestConfig.tournament && activeTestConfig.tournament.title) || 'Wähle, was dir wichtiger ist';

        $matchContainer.html([
            '<h2>' + tournamentTitle + '</h2>',
            '<p id="milestoneMessage" class="milestone-message"></p>',
            '<div class="match">',
            matchCardMarkup(card1Id, card1),
            '<span class="vs">VS</span>',
            matchCardMarkup(card2Id, card2),
            '</div>'
        ].join(''));

        renderMilestoneMessage();
    }

    function matchCardMarkup(cardId, card) {
        if (!card) {
            return '';
        }
        const iconClass = card.icon || '';
        const title = card.name || '';
        const description = card.description || '';
        return [
            '<div class="card" data-card-id="' + cardId + '">',
            '    <div class="card-content">',
            '        <div class="card-info">',
            '            <i class="' + iconClass + '"></i>',
            '            <div class="card-info-title">',
            '                <h3>' + title + '</h3>',
            '                <h4>' + description + '</h4>',
            '            </div>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join('');
    }

    window.selectWinner = function (winnerId) {
        const id = String(winnerId);
        if (typeof scores[id] !== 'number') {
            scores[id] = 0;
        }
        scores[id]++;
        currentMatchIndex++;
        showNextMatch();
    };

    function updateProgress() {
        const totalMatches = matches.length;
        const completedMatches = currentMatchIndex;
        const percentage = totalMatches ? (completedMatches / totalMatches) * 100 : 0;

        $('#progress-text').text(completedMatches + ' / ' + totalMatches);
        $('#progress-bar').css('width', percentage + '%');

        return percentage;
    }

    function showFinalInfo() {
        $duelProgress.hide();
        $topBar.removeClass('is-active selection-active');
        $selectionProgress.css('display', 'none').attr('aria-hidden', 'true');
        $matchStep.hide();
        $infoFinale.show();
        $bottomBar.hide();
        $aboutTrigger.hide();
        $selectHint.hide();
    }

    function getOrdinalSuffix(n) {
        const germanOrdinals = [
            'Erster', 'Zweiter', 'Dritter', 'Vierter', 'Fünfter',
            'Sechster', 'Siebter', 'Achter', 'Neunter', 'Zehnter',
            'Elfter', 'Zwölfter', 'Dreizehnter', 'Vierzehnter', 'Fünfzehnter',
            'Sechzehnter', 'Siebzehnter', 'Achtzehnter', 'Neunzehnter', 'Zwanzigster'
        ];
        return germanOrdinals[n - 1] || (n + '.');
    }

    function showRanking() {
        $duelProgress.hide();
        $topBar.removeClass('is-active selection-active');
        $selectionProgress.css('display', 'none').attr('aria-hidden', 'true');
        $matchStep.show();
        $bottomBar.show();
        $selectHint.hide();
        $nextStep.hide();
        $btnSavePDF.show();
        $btnRestart.show();
        $aboutTrigger.show();

        const resultConfig = (activeTestConfig && activeTestConfig.results) || {};
        const resultTitle = resultConfig.title || 'Dein Ergebnis';
        const resultNote = resultConfig.note || 'Speichere dein Ranking als PDF oder starte einen neuen Durchgang.';

        const ranking = Object.entries(scores)
            .sort(function (a, b) { return b[1] - a[1]; })
            .map(function (entry, index) {
                const id = entry[0];
                const score = entry[1];
                const card = cardData[id];
                if (!card) {
                    return '';
                }
                const ordinalRank = getOrdinalSuffix(index + 1);
                return [
                    '<div class="card noClick result-card">',
                    '    <div class="card-content">',
                    '        <div class="card-info">',
                    '            <i class="' + (card.icon || '') + '"></i>',
                    '            <div class="card-info-title">',
                    '                <h3>' + ordinalRank + ': ' + card.name + '</h3>',
                    '                <h4>' + (card.description || '') + '</h4>',
                    '            </div>',
                    '        </div>',
                    '    </div>',
                    '</div>'
                ].join('');
            })
            .join('');

        const ctaButton = '<div class="result-cta"><a href="https://www.robertschmikale.de/booking-calendar/kostenfreies-kennenlern-gespr%C3%A4ch" class="btn-primary cta-link">Mehr über meine Begleitung erfahren</a></div>';

        $matchContainer.html('<h2>' + resultTitle + '</h2><p class="result-note">' + resultNote + '</p>' + ranking + ctaButton);
    }

});

})(jQuery);

function onCardClick(thisCard) {
    const $card = $(thisCard);
    $card.toggleClass('selected');

    const id = $card.attr('id');
    if ($card.hasClass('selected')) {
        if (!selectedCards.includes(id)) {
            selectedCards.push(id);
        }
    } else {
        selectedCards = selectedCards.filter(function (item) {
            return item !== id;
        });
    }
    if (typeof window.updateSelectionIndicators === 'function') {
        window.updateSelectionIndicators();
    }
}

function createInitialCards(card) {
    return $('<div class="card" id="' + card.id + '" onclick="onCardClick(this)">'
        + '<div class="card-content">'
        + '    <div class="card-info">'
        + '        <i class="' + (card.icon || '') + '"></i>'
        + '        <div class="card-info-title">'
        + '            <h3>' + (card.name || '') + '</h3>'
        + '            <h4>' + (card.description || '') + '</h4>'
        + '        </div>'
        + '    </div>'
        + '</div>'
        + '</div>');
}

function generateMatchups(cards) {
    const matchups = [];
    for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
            matchups.push([cards[i], cards[j]]);
        }
    }
    return matchups;
}
