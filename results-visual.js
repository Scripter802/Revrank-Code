$(document).ready(function () {

    const urlParams = new URLSearchParams(window.location.search);
    const totalRevenue = parseFloat(urlParams.get('totalRevenue'));
    const animDiv = $('#animDiv');
    const profileSection = $('#profile-section');
    const profilePicNav = $('#profile-pic-nav'); 
    profileSection.css('display', 'none');
    $('#mobilePopup').css('display', 'none');
    urlParams.delete('totalRevenue');

    console.log("rank-visual");
    console.log("total revenue: " + totalRevenue);

    profilePicNav.click(function() {
        event.stopPropagation();
        $('#profile-section').toggle();
    });

    $('#close-settings').click(function() {
        $('#profile-settings').css('display', 'none');
        $('#close-settings').css('display', 'none');

        $('#profile-private').css('display', 'flex');
    });

    $('#open-settings').click(function() {
        $('#profile-settings').css('display', 'flex');
        $('#close-settings').css('display', 'block');

        $('#profile-private').css('display', 'none');
    });


    const thresholds = [
        { rank: 'Pawn', value: 25000 },
        { rank: 'Bishop', value: 50000 },
        { rank: 'Knight', value: 100000 },
        { rank: 'Rook', value: 250000 },
        { rank: 'Queen', value: 500000 },
        { rank: 'King', value: 1000000 }
    ];

    const baseImgURL = 'https://uploads-ssl.webflow.com/64dcd192670d2073a8390761/';

    let splashImageList = {
        'Pawn': "656de7d9a03fb6125883dc71_pawnL.svg",
        'Bishop': "656de7d9b67e6c4f17042621_bishopL.svg",
        'Knight': "656de7daf8c57453c773b901_knightL.svg",
        'Rook': "656de7da1b93d2d75e18a7e7_rookL.svg",
        'Queen': "656de7d99524075aed589539_kingL.svg",
        'King': "656de7d94cee050583ee84ef_queenL.svg"
    };

    let rankSystemImages = {
        'Pawn': "65d093d2712bfd103992ef14_pawnD%20(1).svg",
        'Bishop': "65d093d23468e1a2dfef9f9d_bishopD%20(1).svg",
        'Knight': "65d093d229bc0885105b049d_knightD%20(1).svg",
        'Rook': "65d093d2e554edd9044dcd01_rookD%20(1).svg",
        'Queen': "65d093d2021f6552557d8a6e_queenD%20(1).svg",
        'King': "65d093d2021f6552557d8af1_kingD%20(1).svg"
    };

    let rankSystemImages_Mobile = {
        'Pawn': "65d093d25ce7370b86582f09_pawnM%20(1).svg",
        'Bishop': "65d093d23ef7afc28b3fc56f_bishopM%20(1).svg",
        'Knight': "65d093d234864dcb0197da51_knightM%20(1).svg",
        'Rook': "65d093d46a6ff9d90ba10139_rookM%20(1).svg",
        'Queen': "65d093d2ee86ebaacc745bf5_queenM%20(1).svg",
        'King': "65d093d9ff28f0e5abc436bb_kingM%20(1).svg"
    };

    let rankTextMap = calculateRankTextMap(totalRevenue, thresholds);

    let rankAnimsMap = {
        'Pawn': "658d855c2c0ec7b8fc9f7fd1_PawnV.gif",
        'Bishop': "658d855c0fcc780457678512_BishopV.gif",
        'Knight': "658d855d61f9907c2db1d34e_KnightV.gif",
        'Rook': "658d855c38cd3aca0648a547_RookV.gif",
        'Queen': "658d855ddd2cec5744ef0b6c_KingV.gif",
        'King': "658d855dc2e6f5a94edb6ea0_QueenV.gif"
    };

    let rank;

    if (totalRevenue >= thresholds[thresholds.length - 1].value) {
        rank = thresholds[thresholds.length - 1].rank;
    } else {
        for (const threshold of thresholds) {
            if (totalRevenue < threshold.value) {
                rank = threshold.rank;
                break;
            }
        }
    }

    if (rank) {
        $('#rankImgBig, #rankImgSmall', '#rankImgSmall-profile', '#rankImgBig-profile').attr('src', baseImgURL + splashImageList[rank]);
        $('#rankSystemImg').attr('src', baseImgURL + rankSystemImages[rank]);
        $('#rankSystemImg_Mobile').attr('src', baseImgURL + rankSystemImages_Mobile[rank]);
        $('#rankTxt, #rankNameSmall', '#rankTxt-profile', '#rankNameSmall-profile').text(rank);

        if (rankAnimsMap[rank]) {
            animDiv.css('display', 'flex');
            animDiv.find('img').attr('src', baseImgURL + rankAnimsMap[rank]);
        }

        if (rankTextMap[rank]) {
            $('#smallTxt', '#smallTxt-profile').html(rankTextMap[rank]);
        }
    }
});

setTimeout(function() {
    $('#animDiv').css('opacity', '0').on('transitionend', function() {
        $(this).css('display', 'none');
    });
}, 3500);

function calculateRankTextMap(totalRevenue, thresholds) {
    let rankTextMap = {};
    thresholds.forEach((threshold, index) => {
        let percentage = 0;
        if (index === 0) {
            if (totalRevenue <= 0) {
                percentage = "Sub 99%";
            } else {
                let positionInRange = totalRevenue / threshold.value;
                let percentageRange = 50;
                percentage = `Sub ${(99 - (positionInRange * percentageRange)).toFixed(1)}%`;
            }
        } else if (index === thresholds.length - 1) {
            let lowerBound = thresholds[index - 1].value;
            let upperBound = 2000000; 
            let range = upperBound - lowerBound;
            let positionInRange = (totalRevenue - lowerBound) / range;

            let percentageRange = 0.9;
            percentage = `Top ${(1 - (positionInRange * percentageRange)).toFixed(1)}%`;

            if (totalRevenue > 2000000) {
                percentage = "Top 0.1%";
            }
        } else {
            let lowerBound = thresholds[index - 1].value;
            let upperBound = threshold.value;
            let range = upperBound - lowerBound;
            let positionInRange = (totalRevenue - lowerBound) / range;

            let percentageRanges = [
                { rank: 'Bishop', range: [25, 50] },
                { rank: 'Knight', range: [10, 24.99] },
                { rank: 'Rook', range: [5, 9.99] },
                { rank: 'Queen', range: [1, 4.99] }
            ];

            let currentRange = percentageRanges[index - 1].range;
            let percentageRange = currentRange[1] - currentRange[0];
            percentage = currentRange[1] - (positionInRange * percentageRange);

            if (percentage % 1 === 0) {
                percentage = `Top ${percentage}%`;
            } else {
                percentage = `Top ${percentage.toFixed(1)}%`;
            }
        }
        rankTextMap[threshold.rank] = `You Are In The ${percentage} Of RevRank`;
    });
    return rankTextMap;
}
