<#import "template.ftl" as layout>
<@layout.registrationLayout; section>
    <#if section = "htmlBody">
        <script>
            localStorage.setItem('actionType', "VERIFY_EMAIL");
        </script>
     <#elseif section = "form">
    </#if>
</@layout.registrationLayout>