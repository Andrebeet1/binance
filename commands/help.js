module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes disponibles',
    
    async execute(ctx) {
      const helpMessage = `
  🤖 *Commandes disponibles :*
  
  /start - Démarrer le bot et afficher le menu principal
  /rsi - Afficher l’indicateur RSI pour la paire BTCUSDT
  /buysell - Obtenir un signal d’achat ou de vente basé sur les indicateurs techniques
  /help - Afficher ce message d’aide
  
  Utilise les boutons sous le clavier pour naviguer facilement.
  
  Pour toute question, contacte le développeur.
      `;
  
      try {
        await ctx.replyWithMarkdownV2(helpMessage);
      } catch (error) {
        console.error('Erreur commande help:', error);
        await ctx.reply('❌ Impossible d’afficher l’aide pour le moment.');
      }
    }
  };
  