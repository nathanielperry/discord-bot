module.exports = {
    onReject(filter, fn) {
        return (message, next, eject) => {
            const filterResult = filter(message, next, eject);
            if (filterResult === false) return fn(message, next);
            next();
        }
    },

    ejectOnFail(filter, ejectHandler = () => false) {
        return (message, next, eject) => {
            const filterResult = filter(message, next, eject);
            console.log(filterResult);
            if (filterResult === false) {
                eject();
                ejectHandler(message, next);
            }
            next();
        }
    },

    ignoreBots(message, next) {
        if (message.author.bot) return false;
        next();
    },

    ignoreDMs(message, next) {
        if (message.guild === null) return false;
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

    filterContent(...strings) {
        const stringsArray = strings.flat(1);
        return (message, next) => {
            const content = message.content;
            const containsFilteredString = stringsArray.some(filter => {              
                if (filter instanceof RegExp) return filter.test(content);
                if (typeof filter === 'string') return content.includes(filter);
                return false;
            });

            if (containsFilteredString) {
                return false;
            }
            next();
        }
    }
}