
<#macro htmlEmailLayout>

<html>
    <head>
        <link href='https://fonts.googleapis.com/css?family=Baloo Bhai' rel='stylesheet'>
    </head>
    <body>
        <div align="center">
            <table order="0" cellspacing="0"  cellpadding="0" style="width:600px;height:98px;">
                <tr>
                    <td style="padding:20px 160px 20px 160px;width:320px;height:55px;background:#000000">
                            <img src="https://noumenadigital.com/wp-content/uploads/2023/12/logo.png" alt="logo" width="280px" style="width:280px">
                        </a>
                </td>
                </tr>
            </table>
        </div>
        <div align="center">
            <table order="0" cellspacing="0"  cellpadding="0" style="width:600px;height:382px; background:#000000">
                <tr>
                    <td style="padding:0px 40px 0px 40px;width:600px;height:382px;background:#000000">
                        <table order="0" cellspacing="0"  cellpadding="0" style="width:520px;height:382px">
                            <tr>
                                <td style="padding:24px 38px 23px 38px;width:444px;height:36px;background:#FFFFFF;border-top-left-radius:4px;border-top-right-radius:4px">
                                    <div align="center">
                                        <#if user.firstName??>
                                        <span style="font-size:24px; font-family: 'Roboto', 'Helvetica Neue', Helvetica, 'Arial', 'sans-serif', cursive;color:#2B3651; line-height:36px;font-weight:700;">
                                            Hey ${user.firstName}!
                                        </span>
                                        </#if>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0px 200px 15.01px 200px;width:40px;height:42px;background:#FFFFFF;">
                                    <div align="center">
                                        <img src="https://noumenadigitalpub.blob.core.windows.net/public-pictures/mail-Icon.png" alt="letter"  width="60px" height="60px" style="width:60px;height:60px;">
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0px 32px 8px 28px;width:460px;height:30px;background:#FFFFFF;">
                                    <div align="center">
                                        <span style="font-size:20px; font-family: 'Roboto', 'Helvetica Neue', Helvetica, 'Arial', 'sans-serif', cursive;color:#2B3651; line-height:30px;font-weight:400;">
                                            We received a request to reset your password for your nd-demo account. If you didn't make this request, you can safely ignore this email.
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0px 32px 44px 28px;width:460px;height:48px;background:#FFFFFF;">
                                    <div align="center">
                                        <span style="font-size:16px; font-family: 'Roboto', 'Helvetica Neue', Helvetica, 'Arial', 'sans-serif', cursive;color:#2B3651; line-height:24px;font-weight:400;">
                                            If you did request a password reset, please click on the link below to create a new password.
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0px 32px 63px 28px;width:460px;height:40px;background:#FFFFFF;border-bottom-left-radius:4px;border-bottom-right-radius:4px">
                                    <div align="center">   
                                        <table order="0" cellspacing="0"  cellpadding="0" width="300" height="50" style="width:215px;height:40px">
                                            <tr>
                                                <td style="padding:10px 24px 10px 24px;width:100%;height:100%;background:#000000;border-radius: 5px">
                                                    <div align="center">
                                                        <#if link??>
                                                        <a href="${link}" target="_blank">
                                                            <span style="font-size:14px; font-family: 'Roboto', 'Helvetica Neue', Helvetica, 'Arial', 'sans-serif', cursive;color:#FFFFFF; line-height:16.37px;font-weight:700;">
                                                                RESET MY PASSWORD
                                                            </span>
                                                        </a>
                                                        </#if>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </table>  
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 78px 20px 78px;width:444px;height:30px;background:#000000">
                        <div align="center">
                                <span style="font-size:14px; font-family: 'Roboto', 'Helvetica Neue', Helvetica, 'Arial', 'sans-serif', cursive;color:#FFFFFF; line-height:24px;font-weight:500;">
                                    Unsubscribe from emails
                                </span>
                            </a>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </body>
</html>
</#macro>

