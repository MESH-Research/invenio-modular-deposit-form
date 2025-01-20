import { Message } from "semantic-ui-react";
import { Icon } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";

const FormBanner = () => {
  return (
    <Message warning className="mobile-deposit-warning mobile only">
      <Message.Header>
        <Icon name="info circle" />
        {i18next.t("Mobile device support is coming!")}
      </Message.Header>
      <p>{i18next.t("We are working to optimize this deposit form for mobile devices. In the meantime, please use a device with a larger screen to deposit your work.")}</p>
    </Message>
  );
};

export { FormBanner };
