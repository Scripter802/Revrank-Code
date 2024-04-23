
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getDatabase, ref, set, update, orderByChild, query, equalTo, onValue } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC_vyGHFYT3QjkUULZwHqL2p4PYjqVoLnE",
    authDomain: "revrank-d889f.firebaseapp.com",
    databaseURL: "https://revrank-d889f-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "revrank-d889f",
    storageBucket: "revrank-d889f.appspot.com",
    messagingSenderId: "715615705364",
    appId: "1:715615705364:web:523f3f60f1e83b2cb90a01",
    measurementId: "G-TW6MMTZTD2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();



$(document).ready(function () {

const urlParams = new URLSearchParams(window.location.search);
const totalRevenue = parseFloat(urlParams.get('totalRevenue'));
const animDiv = $('#animDiv');
const profileSection = $('#profile-section');
const profilePicNav = $('#profile-pic-nav'); 
profileSection.css('display', 'none');
$('#mobilePopup').css('display', 'none');

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

    console.log("rank: " + rank)

    $('#rankImgBig, #rankImgSmall, #rankImgSmall-profile, #rankImgBig-profile').attr('src', baseImgURL + splashImageList[rank]);
    $('#rankSystemImg').attr('src', baseImgURL + rankSystemImages[rank]);
    $('#rankSystemImg_Mobile').attr('src', baseImgURL + rankSystemImages_Mobile[rank]);
    $('#rankTxt, #rankNameSmall, #rankTxt-profile, #rankNameSmall-profile').text(rank);

    if (rankAnimsMap[rank]) {
        animDiv.css('display', 'flex');
        animDiv.find('img').attr('src', baseImgURL + rankAnimsMap[rank]);
    }

    if (rankTextMap[rank]) {
        $('#smallTxt, #smallTxt-profile').html(rankTextMap[rank]);
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



//Backend connecting--------------------

document.addEventListener("DOMContentLoaded", function () {
    var urlParamsShopName = new URLSearchParams(window.location.search);
    var shopNameUsed = urlParamsShopName.get('shopName');

    if(shopNameUsed == null){
        window.location.href = 'https://www.revrank.io/login';
    }

    shopNameUsed = shopNameUsed.replace(',myshopify,com','')

    const thresholds = [
    { rank: 'Pawn', value: 25000 },
    { rank: 'Bishop', value: 50000 },
    { rank: 'Knight', value: 100000 },
    { rank: 'Rook', value: 250000 },
    { rank: 'Queen', value: 500000 },
    { rank: 'King', value: 1000000 }
    ];

    if (shopNameUsed) {
        console.log("got shop")
        const usersRef = ref(db, 'users');
        const emailQuery = query(usersRef, orderByChild('shopName'), equalTo(shopNameUsed));

        onValue(emailQuery, (snapshot) => {
            if (snapshot.exists()) {
                console.log("snapshop exists! ")
                const userDataObject = snapshot.val();
                const userId = Object.keys(userDataObject)[0];
                const userData = userDataObject[userId];

                //Profile section
                if(userData.instagram == 'none')
                $('#username-block').hide();
                else
                $('#username-profile').text('@' + userData.instagram)

                $('#email-and-shop').text(userData.email.replace(/,/g, '.') + ' | ' + userData.shopName)

                $('#email-settings').val(userData.email.replace(/,/g, '.'));
                $('#email-settings').prop('disabled', true);
                $('#ig-settings').val('@' + userData.instagram);
                $('#shop-settings').val(userData.shopName);
                $('#shop-settings').prop('disabled', true);

                $('#email-settings').css('background-color', '#21272c');
                $('#shop-settings').css('background-color', '#21272c');

                var originalValue = $('#ig-settings').val();

                $('#ig-settings').on('input', function() {
                    var currentValue = $(this).val();
                    if (currentValue !== originalValue) {
                        $('#save-changes').removeClass('disabled').addClass('enabled');
                    } else {
                        $('#save-changes').removeClass('enabled').addClass('disabled');
                    }
                });
            
                $('#save-changes').click(function() {
                    if ($(this).hasClass('enabled')) {
                        var newInstagramValue = $('#ig-settings').val().replace(/^@/, '');
                        originalValue = $('#ig-settings').val(); 
                        $(this).removeClass('enabled').addClass('disabled');
                
                        // Updating the .instagram value in the database
                        const usersRef = ref(db, 'users/' + userId); 
                        update(usersRef, { instagram: newInstagramValue })
                            .then(() => {
                                console.log("Instagram handle updated successfully.");
                            })
                            .catch((error) => {
                                console.error("Error updating Instagram handle:", error);
                            });
                    }
                });                
    
                var rankParam, imageURL, firstNameParam, igHandleParam, gotImageFromServer = false;

                const urlParams = new URLSearchParams(window.location.search);
                const totalRevenueParam = urlParams.get('totalRevenue');

                findUserRank(shopNameUsed, function(rankOfUser) {
                    if (rankOfUser !== null) {
                        $('#rankTextBig').text('You are ranked #' + rankOfUser + ' in the Revrank Leaderboard');
                    } else {
                        $('#rankTextBig').text('Rank not found');
                    }
                });


                userData.totalRevenue = totalRevenueParam;
                if (totalRevenueParam >= thresholds[thresholds.length - 1].value) {
                rankParam = thresholds[thresholds.length - 1].rank;
                } else {
                    for (const threshold of thresholds) {
                        if (totalRevenueParam < threshold.value) {
                            rankParam = threshold.rank;
                            break;
                        }
                    }
                }
                firstNameParam = userData.firstName;
                igHandleParam = userData.instagram;

                console.log("sending IG: " + igHandleParam)


                fetch('https://revrank-image-gen.onrender.com/generate-image', {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ rank: rankParam, firstName: firstNameParam, igHandle: igHandleParam, revenue: totalRevenueParam}),
                    })
                    .then(response => response.blob())
                    .then(blob => {
                        imageURL = URL.createObjectURL(blob);
                        gotImageFromServer = true;

                        if ((/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)) {
                            $('#imageFromServer').attr('src', imageURL);
                        } else if (/Mac/.test(navigator.platform) || /Win/.test(navigator.platform)) {
                            $('#desktopImg_preview').attr('src', imageURL);
                        } else {
                            const downloadLink = document.createElement('a');
                            downloadLink.href = imageURL;
                            downloadLink.download = 'rank.png';
                            downloadLink.id = 'androidIMG'; 
                            document.body.appendChild(downloadLink);  
                        }

                }).catch(error => console.error('Error:', error));

                var fullShopName = shopNameUsed + ",myshopify,com";

                update(ref(db, 'shopifyTokens/' + fullShopName), { owner: userData.email }).then(() => {
                })

                update(ref(db, 'users/' + userId), { totalRevenue: totalRevenueParam }).then(() => {
                    urlParams.delete('totalRevenue');
                    const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
                    window.history.replaceState({}, document.title, newUrl);

                    urlParams.delete('shopName');
                    const newUrl2 = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
                    window.history.replaceState({}, document.title, newUrl2);
                })

                document.querySelector('#firstNameTxt').innerText = userData.firstName;

                setTimeout(function() {
                    $('#loadingDiv').css('display', 'none');

                    if((/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) == false)
                    confetti({ particleCount: 350, spread: 300, origin: { x: .5, y: .2 } });
                }, 2000); 


            document.querySelectorAll('.sharingbutton').forEach(function(button) {
                button.addEventListener('click', function() {

                    if ((/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)){

                        if (gotImageFromServer) {

                            $('#mobilePopup').css('display', 'flex');

                            $('.sharingbutton').each(function() {
                                let buttonChildren = $(this).children();
                                SharingBtn_load(buttonChildren);
                            });
                        } else {

                            
                            const intervalId = setInterval(() => {
                                if (gotImageFromServer) {
                                    clearInterval(intervalId);
                                    document.getElementById('mobilePopup').style.display = 'flex';
                                }
                            }, 150); 

                            document.querySelectorAll('.sharingbutton').forEach(function(sharingButton) {
                            let buttonChildren = sharingButton.children;
                            SharingBtn_load(buttonChildren);
                            });
                        }
                    }else{
                        if(/Mac/.test(navigator.platform) || /Win/.test(navigator.platform)){
                            if(gotImageFromServer){

                            document.getElementById('desktop_popup').style.display = 'flex';
                            document.querySelectorAll('.sharingbutton').forEach(function(sharingButton) {
                                let buttonChildren = sharingButton.children;
                                SharingBtn_load(buttonChildren);
                            });

                            }else{

                                const intervalId = setInterval(() => {
                                if (gotImageFromServer) {
                                    clearInterval(intervalId);
                                    document.getElementById('desktop_popup').style.display = 'flex';
                                }
                                }, 150); 

                                document.querySelectorAll('.sharingbutton').forEach(function(sharingButton) {
                                let buttonChildren = sharingButton.children;
                                SharingBtn_load(buttonChildren);
                            });
                            }
                        }else{
    
                            if(gotImageFromServer){
                                var downloadLink = document.getElementById('androidIMG')
                                downloadLink.click();
                                window.URL.revokeObjectURL(imageURL);
                                document.body.removeChild(downloadLink);

                                setTimeout(function(){
                                    window.location.href = 'intent://instagram.com/a/r/#Intent;package=com.instagram.android;scheme=https;end';
                                }, 1000);
                                
                            }else{
                                const intervalId = setInterval(() => {
                                    if (gotImageFromServer) {
                                            clearInterval(intervalId);

                                            var downloadLink = document.getElementById('androidIMG')
                                            downloadLink.click();
                                            window.URL.revokeObjectURL(imageURL);
                                            document.body.removeChild(downloadLink);

                                            setTimeout(function(){
                                                window.location.href = 'intent://instagram.com/a/r/#Intent;package=com.instagram.android;scheme=https;end';
                                            }, 1000);

                                            document.querySelectorAll('.sharingbutton').forEach(function(sharingButton) {
                                            let buttonChildren = sharingButton.children;
                                            SharingBtn_unload(buttonChildren);
                                        });

                                        }
                                    }, 150);
                                document.querySelectorAll('.sharingbutton').forEach(function(sharingButton) {
                                    let buttonChildren = sharingButton.children;
                                    SharingBtn_load(buttonChildren);
                                });
                            }
                    }
                    
                    }
                });
            });

            document.getElementById('realShareButton').addEventListener('click', function() {           
                setTimeout(function() {
                    window.location.href = 'instagram://story-camera';
                }, 1000);            
            })

            document.getElementById('copy_btn').addEventListener('click', function() {  
                var copyBtn = document.getElementById('copy_btn');
                const image = new Image();
                image.src = imageURL;

                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = image.width;
                    canvas.height = image.height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, 0, 0);

                    canvas.toBlob(blob => {
                    navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
                    .then(() => {
                        copyBtn.style.backgroundColor = '#73a951';
                        copyBtn.style.border = 'none'
                        copyBtn.children[0].innerText = "Copied!"
                    })
                    .catch(err => {

                        copyBtn.style.backgroundColor = 'red';
                        copyBtn.style.border = 'none'
                        copyBtn.innerText = "Error"
                    });
                }, 'image/png');
                };
            })

            document.getElementById('share_x').addEventListener('click', function() {      
                const text = "I’m a verified " + rankParam + ". Numbers don't lie";
               // const text = "Just got my rank on RevRank. I am a " + rankParam + ". Visit revrank.io to get your rank!";
                const hashtags = "rankreveal"; 
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${encodeURIComponent(hashtags)}`;
                window.open(twitterUrl, '_blank');         
            })

            document.getElementById('closeButtonPopup').addEventListener('click', function() {
                document.getElementById('mobilePopup').style.display = 'none';

                document.querySelectorAll('.sharingbutton').forEach(function(sharingButton) {
                    let buttonChildren = sharingButton.children;
                    SharingBtn_unload(buttonChildren);
                });
            });

            $('#closeButtonPopup_desktop').click(function() {
                $('#desktop_popup').css('display', 'none');

                $('.sharingbutton').each(function() {
                    let buttonChildren = $(this).children();
                    SharingBtn_unload(buttonChildren);
                });
            });

            
        } else {
                console.log('No user with email.');
            }
        });
    } else {
        console.log('No email in storage.');
    }
});

function SharingBtn_load(buttonC){
    for (let child of buttonC) {
        if (!child.classList.contains('buttonloading')) {
            child.style.display = 'none';
        }else{
            child.style.display = 'block';
        }
    }
}

function SharingBtn_unload(buttonC){
    for (let child of buttonC) {
        if (child.classList.contains('buttonloading')) {
            child.style.display = 'none';
        }else{
            child.style.display = 'block';
        }
    }
}

function findUserRank(shopNameUsed, callback) {
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
            const usersData = snapshot.val();
            const sortedUsers = Object.values(usersData)
                .filter(user => user.totalRevenue !== "undefined" && user.totalRevenue !== undefined)
                .sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue));
            const userRank = sortedUsers.findIndex(user => user.shopName?.toLowerCase() === shopNameUsed.toLowerCase()) + 1; 
            callback(userRank);
        } else {
            console.log('No users found.');
            callback(null); 
        }
    });
}


