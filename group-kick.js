const { cmd } = require('../command');

cmd({
    pattern: "remove",
    alias: ["kick", "k"],
    desc: "Removes a member from the group",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, reply, quoted, sender, senderNumber
}) => {
    // Check if the command is used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Check if the bot is an admin
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    try {
        // Get group metadata
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        
        // Check if sender is admin
        const senderParticipant = participants.find(p => p.id === sender);
        const isAdmin = senderParticipant && 
                       (senderParticipant.admin === "admin" || 
                        senderParticipant.admin === "superadmin");

        if (!isAdmin) {
            return reply("❌ Only group admins can use this command.");
        }

        let number;
        if (m.quoted) {
            number = m.quoted.sender.split("@")[0]; // Get quoted user
        } else if (q && q.includes("@")) {
            number = q.replace(/[@\s]/g, ''); // Get mentioned user
        } else if (q && !isNaN(q)) {
            number = q.replace(/\D/g, ''); // Get number directly
        } else {
            return reply("❌ Please reply to a message, mention a user, or provide a number.");
        }

        const jid = number + "@s.whatsapp.net";
        
        // Check if target is admin
        const targetParticipant = participants.find(p => p.id === jid);
        if (targetParticipant && 
            (targetParticipant.admin === "admin" || 
             targetParticipant.admin === "superadmin")) {
            return reply("❌ Cannot remove another admin!");
        }

        await conn.groupParticipantsUpdate(from, [jid], "remove");
        reply(`✅ Successfully removed @${number}`, { mentions: [jid] });

    } catch (error) {
        console.error("Remove command error:", error);
        reply("❌ Failed to remove the member: " + error.message);
    }
});
