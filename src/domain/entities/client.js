const { entity, field, id, checker } = require("@herbsjs/herbs");

const Group = entity("Group", {
  title: field(String),
  members: field(Number),
  admins: field([String]),
});

const Client = entity("Client", {
  id: id(String),
  username: field(String),
  type: field(String, { validation: { presence: false } }),
  chat_id: field(Number, { validation: { presence: true } }),
  group: field(Group, { validation: { presence: false } }),
});

const fromTelegram = ({ username, type, chatId, groupInfo }) => {
  const client = new Client();

  client.username = username;
  client.type = type;
  client.chat_id = chatId;

  if (!checker.isEmpty(groupInfo)) {
    const group = Group.fromJSON({
      ...groupInfo,
      admins: groupInfo.admins.map((admin) => admin?.user?.username),
    });

    client.group = group;
  }

  return client;
};

module.exports = Client;
module.exports.fromTelegram = fromTelegram;
