<#import "template.ftl" as layout>
<@layout.registrationLayout; section>
    <#if section = "htmlBody">
        <script>
            localStorage.setItem('redirectUrlError', "${properties.cloudUrlError!}");
        </script>
    <#elseif section = "form">
         <div class="text-info">
                <div id="OnboardingMetaBlock"></div>
                <script type = "text/javascript" src="${url.resourcesPath}/src.js" onload="getExpiredUrlMeta()"></script>
        </div>
    </#if>
</@layout.registrationLayout>