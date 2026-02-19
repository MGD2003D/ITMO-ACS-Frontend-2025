export const ui = {
    showAlert(message, type = 'danger') {
        let container = document.querySelector('.alert-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'alert-container';
            document.body.appendChild(container);
        }

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            <div style="padding-right: 2.5rem;">${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        container.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 5000);
    },

    showSuccess(message) {
        this.showAlert(message, 'success');
    },

    showError(message) {
        this.showAlert(message, 'danger');
    },

    showLoading(container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    },

    showEmpty(container, message = 'No items found') {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <p>${message}</p>
            </div>
        `;
    },

    getDifficultyBadgeClass(difficulty) {
        switch (difficulty) {
            case 'easy':
                return 'bg-success';
            case 'medium':
                return 'bg-warning text-dark';
            case 'hard':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};
