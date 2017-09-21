function PartnerList(vms) {
    this.vms = vms;

    partner_list = {
        "partners": [],
        "pending_partners": [],
        "waiting_partners": []
    }
}

PartnerList.contains = function(name, type) {
    found = false;
    for (var k in partner_list) {
        if (k == type) {
            found = true;
        }
    }
    if (!found) {
        return false;
    }

    for (var kk in partner_list[type]) {
        if (kk == name) {
            return true;
        }
    }
    return false;
}

PartnerList.prototype.add = function(name, type) {
    if (!found) {
        return null; 
    }
    else {
        partner_list[type].push(name);
        return name;
    }
}

PartnerList.prototype.remove = function(name, type) {
    if (this.contains(name, type)) {
        var index = -1;
        for (var i=0; i<partner_list[type].length; i++) {
            if (partner_list[type][i] == name) {
                index = i;
            }
        }

        if (index >= 0) {
            partner_list[type].remove(index);
            return true;
        }
        else {
            return false;
        }
    }
}

