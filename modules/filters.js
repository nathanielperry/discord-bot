const { result } = require("underscore");

module.exports = {
    onReject(filter, fn) {
        return async (message, next, eject) => {
            const filterResult = await filter(message, next, eject);
            if (filterResult === false) return fn(message, next);
            next();
        }
    },

    ejectOnFail(filters, ejectHandler = () => false) {
        const filtersArray = [].concat(filters);
        return async (message, next, eject) => {
            const filterResults = filtersArray.map(filter => {
                const result = filter(message, next, eject);
                return result;
            });

            const finalResults = await Promise.all(filterResults);
            if (!finalResults.every(res => res !== false)) {
                eject();
                ejectHandler(message, next);
                return false;
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
            const userRoles = message.member.roles.cache;

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
            const userRoles = message.member.roles.cache;

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