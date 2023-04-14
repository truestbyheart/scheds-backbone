import { FRONTEND_URL } from '../../../../config/config';

export interface IWorkspace {
  workspaceName: string;
  description: string;
  workspaceToken: string | undefined;
}

export default (data: IWorkspace) => {
  const { workspaceName, workspaceToken, description } = data;
  return `
  <table
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="font-family: Arial, sans-serif; background-color: #eeeeee;"
    >
      <tr>
        <td style="padding: 10px 0 30px 0;">
          <table
            align="center"
            width="600"
            cellspacing="0"
            cellpadding="0"
            style="border-collapse: collapse;"
          >
            <tr>
              <td
                bgcolor="#58AF9B"
                style="
                  width: 100%;
                  color: #ffffff;
                  padding: 10px 10px 10px 10px;
                "
              >
                <h3>Connectedly</h3>
              </td>
            </tr>
            <tr>
              <td
                align="center"
                style="padding: 10px 10px 10px 10px; background-color: #ffffff;"
              >
                <table  cellpadding="0" cellspacing="0" style="padding: 10px">
                  <tr>
                    <td style="padding: 10px"><b>Workspaname:</b> &nbsp;${workspaceName}</td>
                  </tr>
                  <tr>
                    <td style="text-align: justify; padding: 10px">
                      <b>Description:</b> &nbsp;${description}
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 20px">
                      <a href="${FRONTEND_URL}/workspace/join?token=${workspaceToken}" style="color: #ffffff;text-decoration: none;padding: 10px 12px; background-color: #58AF9B;border-radius: 30px">
                        Join Workspace
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td
                bgcolor="#58AF9B"
                align="center"
                style="
                  width: 100%;
                  color: #ffffff;
                  padding: 10px 10px 10px 10px;
                "
              >
                <h3>&copy; Connectedly, ${new Date().getFullYear()}</h3>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};
