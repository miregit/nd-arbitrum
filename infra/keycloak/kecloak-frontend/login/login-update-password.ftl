<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>
    <#if section = "htmlBody">
        <script>
            localStorage.setItem('actionType', "UPDATE_PASSWORD");
        </script>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="robots" content="noindex, nofollow">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>ND-demo Set Password</title>
        <link rel="shortcut icon" href="https://noumenadigital.com/wp-content/uploads/2023/12/NOUMENA_icon_black-150x150.png" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@500&display=swap" rel="stylesheet">
        <style type="text/css">
            html,
            body {
                height: 100%;
                padding: 0;
                margin: 0;
                background-color: #FFFFFF;
            }
            body {
                background-image: url('https://noumenadigital.com/wp-content/uploads/2024/01/pawel-czerwinski-fPN1w7bIuNU-unsplash-scaled-e1704798490562.jpg');
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .container {
                width: 500px;
                margin: 0 auto;
            }
            .container-header {
                padding-bottom: 24px;
                display: flex;
                justify-content: center;
            }
            .container-body {
                background-color: white;
                border-radius: 12px;
            }
            .container-padding {
                padding: 24px 100px 20px;
            }
            .container-form-header-title {
                color: #10171D;
                text-align: center;
                font-family: Work Sans;
                font-size: 22px;
                font-style: normal;
                font-weight: 600;
                line-height: 20px;
                letter-spacing: -0.08px;
                padding-bottom: 12px;
            }
            .container-form-header-subtitle {
                color: #6C7289;
                font-family: Work Sans;
                font-size: 14px;
                font-style: normal;
                font-weight: 500;
                line-height: 18px;
                text-align: center;
                padding-bottom: 40px;
            }

            .container-form-input-label {
                color: #000;
                font-family: Work Sans;
                font-size: 12px;
                font-style: normal;
                font-weight: 500;
                line-height: 16px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                margin-bottom: 4px;
                display: block;
            }
            
            .container-form-input input  {
                width: 100%;
                margin-bottom: 34px;
                font-family: Work Sans;
                border-radius: 10px;
                border: 1px solid #696F86;
                background: #FFF;
                display: block;
                box-sizing: border-box;
                height: 40px;
                padding: 10px 12px;
            }
            .back-to-login-wrapper {
                box-sizing: border-box;
                display: flex;
                flex-wrap: wrap;
                width: 100%;
                flex-direction: row;
                -webkit-box-pack: center;
                justify-content: center;
                color: #333333;
            }
            .back-to-login-link {
                margin: 0;
                color: #000000;
                cursor: pointer;
                text-decoration: none;
                line-height: normal;
            }

            .back-to-login-text {
                margin: 0;
                font-size: 14px;
                font-family: Work Sans;
                line-height: 1.75;
                font-weight: 600;
                color: #4E7685;
            }

            .primary-button {
                border: 0px;
                font-weight: bold;
                width: 300px;
                padding: 12px 16px;
                border-radius: 24px;
                background: #4E7685;
                color: #FFF;
                font-family: Work Sans;
                font-size: 14px;
                text-align: center;
                display: block;
                cursor: pointer;
                letter-spacing: -0.08px;
                margin-bottom: 8px;
            }

            .container-form-error {
                color: #CC0000;
                font-family: Work Sans;
                font-size: 14px;
                font-style: normal;
                font-weight: 500;
                line-height: 18px;
                text-align: center;
            }

            .container-form-error-div  {
                width: 100%;
                margin-bottom: 25px;
                font-family: Work Sans;
                border-radius: 10px;
                background: #FFF;
                display: block;
                box-sizing: border-box;
                height: 20px;
            }
        </style>
    <#elseif section = "form">
        <div class="container">
            <div class="container-body">
                <div class="container-padding">
                    <div class="container-header">
                        <img width="78" height="72" src="https://noumenadigital.com/wp-content/uploads/2023/09/noumena-svg.svg" alt="nd-demo" />
                    </div>
                    <div class="container-form-header">
                        <div class="container-form-header-title">Set Password</div>
                        <div class="container-form-header-subtitle">Please enter a new password below</div>
                    </div>

                    <form id="kc-passwd-update-form" class="${properties.kcFormClass!}" action="${url.loginAction}" method="post">
                        <div class="container-form-input">
                            <label for="password-new" class="container-form-input-label">NEW PASSWORD</label>
                            <input type="password" id="password-new" 
                                name="password-new" class="container-form-input-field" 
                                autofocus autocomplete="new-password"
                                aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>"
                            />
                            <#if messagesPerField.existsError('password')>
                                <div  class="container-form-error-div">
                                    <span id="input-error-password" class="container-form-error" aria-live="polite">
                                        ${kcSanitize(messagesPerField.get('password'))?no_esc}
                                    </span>
                                </div>
                            </#if>
                        </div>
                        <div class="container-form-input">
                            <label for="password-confirm" class="container-form-input-label">CONFIRM NEW PASSWORD</label>
                            <input type="password" id="password-confirm" 
                                name="password-confirm" class="container-form-input-field" 
                                autocomplete="new-password"
                                aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                            />
                            <#if messagesPerField.existsError('password-confirm')>
                                <div  class="container-form-error-div">
                                    <span id="input-error-password-confirm" class="container-form-error" aria-live="polite">
                                        ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                                    </span>
                                </div>
                            </#if>
                        </div>
                        <div id="kc-form-buttons" class="container-form-input">
                            <button class="primary-button" type="submit">SET PASSWORD</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>