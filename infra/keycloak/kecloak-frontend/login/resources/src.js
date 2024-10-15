

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getMetaBlock(){
    const user = getParameterByName('user');
    localStorage.setItem('user', user);
    const actionUri = document.getElementById('actionUri').innerHTML;
    const metaBlock = "<meta http-equiv=\"refresh\" content=\"0;url=" + actionUri + "&user=" +  user + "\" />"
    document.getElementById("metaBlock").innerHTML = metaBlock
}
function getOnboardingurlMeta(){
    const user = localStorage.getItem('user');
    const baseUrl = localStorage.getItem('redirectUrl');
    const onboardingPath = localStorage.getItem('onboardingPath');
    const action = localStorage.getItem('actionType');
    console.log(`blblb0 action  = ${action}`)
    var metaBlock = "<meta http-equiv=\"refresh\" content=\"0;url=" + baseUrl + onboardingPath + "?user=" +  user + "\" />"
    if (action == "UPDATE_PASSWORD"){
        console.log(`blblb1 action  = ${action}`)
        metaBlock = "<meta http-equiv=\"refresh\" content=\"0;url=" + baseUrl + "\" />"
    }
    console.log(`blblb2 metaBlock  = ${metaBlock}`)
    document.getElementById("OnboardingMetaBlock").innerHTML = metaBlock
    localStorage.removeItem('actionType')
}

function getExpiredUrlMeta(){
    const user = localStorage.getItem('user');
    const baseUrl = localStorage.getItem('redirectUrl');
    const errorPath = localStorage.getItem('errorPath');
    const metaBlock = "<meta http-equiv=\"refresh\" content=\"0;url=" + baseUrl + errorPath + "\" />"
    document.getElementById("OnboardingMetaBlock").innerHTML = metaBlock
}