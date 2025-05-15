class Notifier {
  static async checkDueDates(io) {
    const tasks = await Task.find({
      dueDate: { 
        $lte: new Date(Date.now() + 24*60*60*1000), // 24h before due
        $gte: new Date() 
      }
    }).populate('assignees');

    tasks.forEach(task => {
      task.assignees.forEach(user => {
        io.to(`user-${user._id}`).emit('due-date-reminder', {
          taskId: task._id,
          title: task.title
        });
      });
    });
  }
}

// Run daily
cron.schedule('0 9 * * *', () => Notifier.checkDueDates(io));