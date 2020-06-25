module.exports = {
    ignoreBots(message, next) {
        if (message.author.bot) return;
        next();
    },

    ignoreDMs(message, next) {
        if (message.guild === null) return;
        next();
    },
    
    restrictToChannels: (...channels) => {
        const channelsArray = channels.flat(1);
        return (message, next) => {
            const channelName = message.channel.name;
            const hasPermission = channelsArray.some(allowedChannel => {
                return (allowedChannel instanceof RegExp && allowedChannel.test(channelName))
                || (allowedChannel === channelName)
            });

            return hasPermission ? next() : false;
        }
    },

    excludeChannels: (...channels) => {
        const channelsArray = channels.flat(1);
        return (message, next) => {
            const channelName = message.channel.name;
            const isExcluded = channelsArray.some(allowedChannel => {
                return (allowedChannel instanceof RegExp && allowedChannel.test(channelName))
                || (allowedChannel === channelName)
            });

            return isExcluded ? false : next();
        }
    },

    restrictToRoles: (...roles) => {
        const rolesArray = roles.flat(1);
        return (message, next) => {
            const userRoles = message.member.roles;

            const hasPermission = rolesArray.some(allowedRole => {
                if (allowedRole instanceof RegExp && userRoles.some(r => allowedRole.test(r.name))) return true;
                if (userRoles.some(r => r.name === allowedRole)) return true;
                return false;
            });

            return hasPermission ? next() : false;
        }
    },

    excludeRoles: (...roles) => {
        const rolesArray = roles.flat(1);
        return (message, next) => {
            const userRoles = message.member.roles;

            const isExcluded = rolesArray.some(allowedRole => {
                if (allowedRole instanceof RegExp && userRoles.some(r => allowedRole.test(r.name))) return true;
                if (userRoles.some(r => r.name === allowedRole)) return true;
                return false;
            });

            return isExcluded ? false: next();
        }
    },
}