exports.handleGiteaWebhook = async (req, res) => {
    try {
      const event = req.headers['x-gitea-event'];
      
      if (event === 'push') {
        await Repository.findOneAndUpdate(
          { giteaRepoId: req.body.repository.id },
          { $set: { updatedAt: new Date() } }
        );
      }
      
      res.status(200).end();
    } catch (error) {
      res.status(500).end();
    }
  };