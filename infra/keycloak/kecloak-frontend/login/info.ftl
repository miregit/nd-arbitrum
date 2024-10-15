<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "title">
    ${message.summary}
    <#elseif section = "back">
    <#if client?? && client.baseUrl?has_content>
        <a class="link-back" href="${client.baseUrl}">
            <i class="holi-icon-arrow_back"></i>
            ${msg("backToApplication")}
        </a>
    </#if>
    <#elseif section = "form">
        <#if skipLink??>
            <div class="text-info">
                <div id="OnboardingMetaBlock"></div>
                <script type = "text/javascript" src="${url.resourcesPath}/src.js" onload="getOnboardingurlMeta()"></script>
            </div>
        <#else>
            <#if pageRedirectUri??>
                <p><a class="button" href="${pageRedirectUri}">${msg("backToApplication")?no_esc}</a></p>
            <#elseif actionUri??>
                <div class="text-info">

                </div>
                <div id="actionUri"  style="visibility: hidden;"></div>
                <script>
                        document.getElementById("actionUri").innerHTML = "${actionUri}";
                </script>
                <div id="metaBlock"></div>
                <script type = "text/javascript" src="${url.resourcesPath}/src.js" onload="getMetaBlock()"></script>
                
            <#elseif client.baseUrl??>
                <p><a class="button" href="${client.baseUrl}">${msg("backToApplication")?no_esc}</a></p>
            </#if>
        </#if>
    </#if>
</@layout.registrationLayout>