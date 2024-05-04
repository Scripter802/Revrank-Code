
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getDatabase, ref, set, get, remove, update, orderByChild, query, equalTo, onValue } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js";

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
const baseImgURL = 'https://uploads-ssl.webflow.com/64dcd192670d2073a8390761/';
var userID, shopRevenue, shopNameUsed;
var userData;

const thresholds = [
    { rank: 'Pawn', value: 25000 },
    { rank: 'Bishop', value: 50000 },
    { rank: 'Knight', value: 100000 },
    { rank: 'Rook', value: 250000 },
    { rank: 'Queen', value: 500000 },
    { rank: 'King', value: 1000000 }
];

//Fetching user data
$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    let promises = [];

    userID = urlParams.get('u');

    console.log("userID: " + userID)
    if (userID) {
        console.log('Normal login');
        urlParams.delete('u');
        const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, document.title, newUrl);

        promises.push(fetchUserDataByEmail(userID, db));

        //setup shopNameUsed + shopRevenue for login
    } else {
        console.log("no email")
        shopRevenue = parseFloat(urlParams.get('shopRevenue'));
        if (!userID && !shopRevenue) {
            console.log("redirect: userID: " + userID + " && " + shopRevenue )
            window.location.href = 'https://www.revrank.io/login';
        }
        shopNameUsed = urlParams.get('shopName').replace(',myshopify,com', '');

        urlParams.delete('shopRevenue');
        urlParams.delete('shopName');
        const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, document.title, newUrl);

        console.log('#1 time user');
        promises.push(fetchUserDataByShopNameAndUpdateRevenue(shopNameUsed, shopRevenue, db));
    }

    Promise.all(promises).then(() => {
    //All good!!!!
    console.log("all good!")


        //Remove invalid stores
        cleanupFirebaseUserData(userData.email, db);

        document.querySelector('#firstNameTxt').innerText = userData.firstName;

        const animDiv = $('#animDiv');
        const profileSection = $('#profile-section');
        const profilePicNav = $('#profile-pic-nav'); 
        profileSection.css('display', 'none');
        $('#mobilePopup').css('display', 'none');

        //Profile section
        if(userData.instagram == 'none')
        $('#username-block').hide();
        else
        $('#username-profile').text('@' + userData.instagram)

        $('#email-and-shop').text(userData.firstName.replace(/,/g, '.') + ' ' + userData.lastName)

        $('#email-settings').val(userData.email.replace(/,/g, '.'));
        $('#email-settings').prop('disabled', true);
        $('#ig-settings').val('@' + userData.instagram);
        $('#shop-settings').val(userData.shopName);
        $('#shop-settings').prop('disabled', true);

        $('#email-settings').css('background-color', '#21272c');
        $('#shop-settings').css('background-color', '#21272c');

        if(userData.profilePic != undefined)
        {
            $('#profile-pic').css('background-image', 'url(' + userData.profilePic + ')');
            $('#profile-pic-nav').children().first().css('background-image', 'url(' + userData.profilePic + ')');
        }

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

        $('.share-profile-class').click(function() {
            var sharingUrl = "https://www.revrank.io/sharing?s=" + userData.id;
        
            navigator.clipboard.writeText(sharingUrl).then(() => {
                console.log('Copying to clipboard was successful!');
                        
                $(this).css({
                    'background-color': '#7ab861',
                    'border-color': 'white',
                    'color': 'white'
                })
                $(this).children().first().text('Link copied!');
        

                setTimeout(() => {
                    $(this).css({
                        'color': 'white',
                        'background-color': 'transparent',
                        'border-color': '#b829e3'
                    })
                    $(this).children().first().text('Share Profile');
                }, 2000);
        
            }, (err) => {
                console.error('Could not copy text: ', err);
                alert('Failed to copy URL. Please try again.');
            });
        
        });
        
        $('.share-profile-class-settings').click(function() {
            var sharingUrl = "https://www.revrank.io/sharing?s=" + userData.id;
        
            navigator.clipboard.writeText(sharingUrl).then(() => {
                console.log('Copying to clipboard was successful!');
                        
                $(this).css({
                    'background-color': '#7ab861',
                    'border-color': 'white',
                    'color': 'white'
                })
                $(this).children().first().text('Link copied!');
        

                setTimeout(() => {
                    $(this).css({
                        'color': 'white',
                        'background-color': 'transparent',
                        'border-color': '#b829e3'
                    })
                    $(this).children().first().text('Share Profile');
                }, 2000);
        
            }, (err) => {
                console.error('Could not copy text: ', err);
                alert('Failed to copy URL. Please try again.');
            });
        
        });

        var rankParam, imageURL, firstNameParam, igHandleParam, gotImageFromServer = false;
        const totalRevenueParam = userData.totalRevenue;

        findUserRank(userData.email, function(rankOfUser) {
            if (rankOfUser !== null) {
                $('#rankTextBig').text('You are ranked #' + rankOfUser + ' in the Revrank Leaderboard');
            } else {
                $('#rankTextBig').text('Rank not found');
            }
        });

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
        console.log("totalRevenueParam: " + totalRevenueParam)
        console.log("rank: " + rankParam)

        if(totalRevenueParam == null)
        return

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
                                $('#mobilePopup').css('display', 'flex');
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
                        
                        $('#desktop_popup').css('display', 'flex');
                        document.querySelectorAll('.sharingbutton').forEach(function(sharingButton) {
                            let buttonChildren = sharingButton.children;
                            SharingBtn_load(buttonChildren);
                        });

                        }else{

                            const intervalId = setInterval(() => {
                            if (gotImageFromServer) {
                                clearInterval(intervalId);
                                $('#desktop_popup').css('display', 'flex');
                            }
                            }, 150); 

                            document.querySelectorAll('.sharingbutton').forEach(function(sharingButton) {
                            let buttonChildren = sharingButton.children;
                            SharingBtn_load(buttonChildren);
                        });
                        }
                    }else{

                        if(gotImageFromServer){
                            var downloadLink = $('#androidIMG')
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

                                        var downloadLink = $('#androidIMG')
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

        $('#realShareButton').on('click', function() {           
            setTimeout(function() {
                window.location.href = 'instagram://story-camera';
            }, 1000);            
        })

        $('#copy_btn').on('click', function() {  
            var copyBtn = $('#copy_btn');
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
                        copyBtn.css({
                            backgroundColor: '#73a951',
                            border: 'none'
                        });
                        copyBtn.children().text("Copied!");
                    })
                    .catch(err => {
                        copyBtn.css({
                            backgroundColor: 'red',
                            border: 'none'
                        });
                        copyBtn.text("Error");
                    });
                }, 'image/png');
            };
        });
        

        $('#share_x').on('click', function() {      
            const text = "I’m a verified " + rankParam + ". Numbers don't lie";
            // const text = "Just got my rank on RevRank. I am a " + rankParam + ". Visit revrank.io to get your rank!";
            const hashtags = "rankreveal"; 
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${encodeURIComponent(hashtags)}`;
            window.open(twitterUrl, '_blank');         
        })

        $('#closeButtonPopup').on('click', function() {
            $('#mobilePopup').style.display = 'none';

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

        //profile pic upload-------------------------

        $('body').append('<input type="file" id="fileUploader" style="display: none;">');

        $('#profile-pic').click(function() {
            $('#fileUploader').click();
        });

        $('#profile-pic').hover(
            function() {
                $('#profile-pic-overlay').show();
            }, 
            function() {
                $('#profile-pic-overlay').hide();
            }
        );

        $('#fileUploader').on('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                // Reference to the storage bucket location
                const storage = getStorage(app);
                const storageRef = sRef(storage, 'profile-pictures/' + file.name);

                // Upload file to Firebase Storage
                uploadBytes(storageRef, file).then((snapshot) => {
                    console.log('Uploaded a blob or file!');

                    // Get the download URL
                    getDownloadURL(snapshot.ref).then((downloadURL) => {
                        console.log('File available at', downloadURL);

                        $('#profile-pic').css('background-image', 'url(' + downloadURL + ')');
                        $('#profile-pic-nav').children().first().css('background-image', 'url(' + downloadURL + ')');


                        console.log("auth.currentUser: " + auth.currentUser);

                        // Assuming you have the user's email
                        const emailValue = auth.currentUser.email; // Modify as needed to match how you get the user email

                        // Safe path to use in Firebase keys
                        const safeEmail = emailValue.replace(/\./g, ','); // Firebase keys can't contain '.'

                        // Reference to the user's data in the database
                        const userRef = ref(db, 'users/' + safeEmail);

                        // Update the user's profile picture URL in the database
                        update(userRef, {
                            profilePic: downloadURL
                        }).then(() => {
                            console.log("Profile picture URL added to database successfully!");
                        }).catch((error) => {
                            console.error("Error updating database: ", error);
                        });
                    });
                }).catch((error) => {
                    console.error("Error uploading file: ", error);
                });
            }
        });

        //profile pic upload-------------------------

        profilePicNav.click(function() {
            event.stopPropagation();
            $('#profile-section').toggle();
        });

        $('#close-settings').click(function() {
            // Check if profile-discords is visible
            if ($('#profile-discords').is(':visible')) {
                // Hide profile-discords and show profile-settings
                $('#profile-discords').hide();
                $('#profile-settings').show();
        
                // Show servers_title, hide others
                $('#servers_title').show();
                $('#shops_title').hide();
                $('#editTitle').hide();
                $('#close-settings').show();
            }
            // Check if profile-shops is visible
            else if ($('#profile-shops').is(':visible')) {
                // Hide profile-shops and show profile-settings
                $('#profile-shops').hide();
                $('#profile-settings').show();
        
                // Show shops_title, hide others
                $('#editTitle').show();
                $('#servers_title').hide();
                $('#editTitle').hide();
                $('#close-settings').show();
            }
            // Check if profile-settings is visible
            else if ($('#profile-settings').is(':visible')) {
                // Hide profile-settings and show profile-private
                $('#profile-settings').hide();
                $('#profile-private').show();
        
                // Show editTitle, hide others
                $('#editTitle').hide();
                $('#servers_title').hide();
                $('#shops_title').hide();
                $('#close-settings').hide();
            }
            // Check if profile-private is visible
            else if ($('#profile-private').is(':visible')) {
                // Hide all titles and the close button
                $('#editTitle').hide();
                $('#servers_title').hide();
                $('#shops_title').hide();
                $('#close-settings').hide();
            }
        });        
        

        $('#manage-shops').click(function() {
            // Hide main settings and show shops screen
            $('#profile-settings').hide();
            $('#profile-shops').css('display', 'flex');
        
            // Optionally, adjust titles as needed
            $('#shops_title').show();
            $('#servers_title').hide();
            $('#editTitle').hide();
        });
          
        $('#open-settings').click(function() {
            $('#profile-settings').css('display', 'flex');
            $('#editTitle').show();
            $('#close-settings').css('display', 'block');

            $('#profile-private').css('display', 'none');
        });


        //rank stuff--------------------------------
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

        let rankTextMap = calculateRankTextMap(totalRevenueParam, thresholds);

        let rankAnimsMap = {
            'Pawn': "658d855c2c0ec7b8fc9f7fd1_PawnV.gif",
            'Bishop': "658d855c0fcc780457678512_BishopV.gif",
            'Knight': "658d855d61f9907c2db1d34e_KnightV.gif",
            'Rook': "658d855c38cd3aca0648a547_RookV.gif",
            'Queen': "658d855ddd2cec5744ef0b6c_KingV.gif",
            'King': "658d855dc2e6f5a94edb6ea0_QueenV.gif"
        };

        let rank = rankParam;

        if (rank) {
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

        //rank stuff--------------------------------
        
    
    }).catch(error => {
        console.error("Failed to process user data or updates:", error);
    });

});

function cleanupFirebaseUserData(email, db) {
    const sanitizedEmail = email.replace(/\./g, ',');
    const shopifyTokensRef = ref(db, 'shopifyTokens');
    const tokensQuery = query(shopifyTokensRef, orderByChild('owner'), equalTo(sanitizedEmail));

    get(tokensQuery).then(snapshot => {
        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            const keys = Object.keys(data);

            // If the document contains only the 'owner' key, delete it
            if (keys.length === 1 && keys[0] === 'owner') {
                remove(childSnapshot.ref).then(() => {
                    console.log(`Deleted token for owner: ${sanitizedEmail}`);
                }).catch(error => {
                    console.error(`Error deleting token for owner: ${sanitizedEmail}`, error);
                });
            }
        });
    }).catch(error => {
        console.error("Error fetching shopifyTokens:", error);
    });
}

function fetchUserDataByEmail(usersID, db) {
    return new Promise((resolve, reject) => {
        const usersRef = ref(db, 'users');
        const userIDQuery = query(usersRef, orderByChild('id'), equalTo(usersID));

        get(userIDQuery).then((snapshot) => {
            if (snapshot.exists()) {
                const firstUserKey = Object.keys(snapshot.val())[0]; // Get the first key
                const firstUserData = snapshot.val()[firstUserKey]; // Get the data of the first user
                console.log('User data fetched for usersID:', usersID);
                handleUserData(firstUserData)
                    .then(resolve)
                    .catch(reject);
            } else {
                console.log('No user found for this usersID:', usersID);
                resolve();
            }
        }).catch((error) => {
            console.log('Failed to fetch user data:', error);
            reject(error);
        });
    });
}

function fetchUserDataByShopNameAndUpdateRevenue(shopName, shopRevenue, db) {
    return new Promise((resolve, reject) => {
        const shopifyTokensRef = ref(db, 'shopifyTokens');
        var shopNameR = shopName + '.myshopify.com';
        const shopQuery = query(shopifyTokensRef, orderByChild('shopName'), equalTo(shopNameR));

        const unsubscribe = onValue(shopQuery, (shopSnapshot) => {
            unsubscribe(); // Detach listener after receiving data
            if (shopSnapshot.exists()) {
                shopSnapshot.forEach((shopChildSnapshot) => {
                    const ownerId = shopChildSnapshot.val().owner;
                    if (ownerId) {
                        const usersRef = ref(db, `users/${ownerId}`);
                        get(usersRef).then(userSnapshot => {
                            if (userSnapshot.exists()) {
                                let currentRevenue = userSnapshot.val().totalRevenue || 0;
                                let newTotalRevenue = currentRevenue + shopRevenue;
                                console.log("current: " + currentRevenue + " + " + shopRevenue);
                                update(userSnapshot.ref, { totalRevenue: newTotalRevenue })
                                .then(() => {
                                    // Re-fetch the updated user data
                                    return get(usersRef);
                                })
                                .then(updatedUserSnapshot => {
                                    if (updatedUserSnapshot.exists()) {
                                        // Handle user data after update and resolve
                                        return handleUserData(updatedUserSnapshot.val()).then(() => {
                                            console.log('Revenue update and user data handling completed for owner ID:', ownerId);
                                            resolve();
                                        });
                                    } else {
                                        console.log('Failed to refetch updated user data for owner ID:', ownerId);
                                        resolve();
                                    }
                                })
                                .catch(error => {
                                    console.log('Failed to update user data:', error);
                                    reject(error);
                                });
                            } else {
                                console.log('User not found for owner ID:', ownerId);
                                resolve();
                            }
                        })
                        .catch(error => {
                            console.log('Failed to fetch user data:', error);
                            reject(error);
                        });
                    } else {
                        console.log('Owner ID not found in shop token data:', shopChildSnapshot.key);
                        resolve();
                    }
                });
            } else {
                console.log('No shop found with this name:', shopName);
                resolve();
            }
        }, (error) => {
            console.log('Failed to fetch shop data:', error);
            unsubscribe();
            reject(error);
        });
    });
}


function handleUserData(userDataP) {
    return new Promise((resolve, reject) => {
        userData = userDataP
        console.log('Fetched User Data:', userData);
        resolve(); // Resolve when handling is complete
    });
}




setTimeout(function() {
$('#animDiv').css('opacity', '0').on('transitionend', function() {
    $(this).css('display', 'none');
});
}, 5000);

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



//Functions------------------------


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

function findUserRank(usersEmail, callback) {
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
            const usersData = snapshot.val();
            const sortedUsers = Object.values(usersData)
                .filter(user => user.totalRevenue !== "undefined" && user.totalRevenue !== undefined)
                .sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue));
            const userRank = sortedUsers.findIndex(user => user.email?.toLowerCase() === usersEmail.toLowerCase()) + 1; 
            callback(userRank);
        } else {
            console.log('No users found.');
            callback(null); 
        }
    });
}


