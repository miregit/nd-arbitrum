<#outputformat "plainText">
<#assign requiredActionsText><#if requiredActions??><#list requiredActions><#items as reqActionItem>${msg("requiredAction.${reqActionItem}")}<#sep>, </#sep></#items></#list></#if></#assign>
<#assign requiredActionsValues><#if requiredActions??><#list requiredActions><#items as reqActionItem>${reqActionItem}<#sep>, </#sep></#items></#list></#if></#assign>
</#outputformat>

<#import "template.ftl" as layout>
<@layout.htmlEmailLayout; section>
  <#assign attributes = user.getAttributes()>
  <#if attributes.isFinishedOnboarding??>
    <#if section = "title">
      <#if attributes.isFinishedOnboarding?boolean == false >
        ${msg("emailVerificationTitle")?no_esc}
      <#elseif attributes.isFinishedOnboarding?boolean == true>
          ${msg("updatePasswordTitle")?no_esc}
      </#if>
    <#elseif section = "subtitle">
      <#assign subtitle = "genericExecuteActionsBodyHtml" />
      <#if attributes.isFinishedOnboarding?boolean == false>
        <#assign subtitle = "emailVerificationSubtitle" />
      <#elseif attributes.isFinishedOnboarding?boolean == true>
          <#assign subtitle = "updatePasswordSubtitle" />
      </#if>
      ${kcSanitize(msg(subtitle))?no_esc}
    <#elseif section = "buttonText">
      <#assign buttonText = "genericExecuteActionsSubject" />
      <#if attributes.isFinishedOnboarding?boolean == false>
        <#assign buttonText = "emailVerificationButton" />
      <#elseif attributes.isFinishedOnboarding?boolean == true>
          <#assign buttonText = "updatePasswordButton" />
      </#if>
      ${kcSanitize(msg(buttonText))?no_esc}
    </#if>
  <#else>
    <#if section = "title">
        ${msg("updatePasswordTitle")?no_esc}
    <#elseif section = "subtitle">
        <#assign subtitle = "updatePasswordSubtitle" />
      ${kcSanitize(msg(subtitle))?no_esc}
    <#elseif section = "buttonText">
        <#assign buttonText = "updatePasswordButton" />
      ${kcSanitize(msg(buttonText))?no_esc}
    </#if>
  </#if>
</@layout.htmlEmailLayout>