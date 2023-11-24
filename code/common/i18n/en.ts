export default {
    backend:{
        task:"Task",
        bug:"Bug",
        ticket:"Ticket",
        default:"Default",
        open:"Open",
        inProgress:"In Progress",
        closed:"Closed",
        resolved:"Resolved",
        openToProgress:"Open -> In Progress",
        progressToOpen:"In Progress -> Open",
        openToClosed:"Open -> Closed",
        closedToOpen:"Closed -> Open",
        progressToResolved:"In Progress -> Resolved",
        resolvedToProgress:"Resolved -> In Progress",
        newFolder:"New Folder",
        newProject:"New Project",
        newTask:"New Task",
        newBug:"New Bug",
        newTicket:"New Ticket",
        newWikiSpace:"New Wiki Space",
        newWiki:"New Wiki",
        newWikiContent:"hi,this is a new wiki content!Welcome to Teamlinker!"
    },
    help:{
        module:"module is a space that includes many issues,you can classify issues using modules",
        label:"you can specify an issue with multiply labels so that ths issue has different characters",
        access:`there are 4 access types:
        default:this is default role of this project for all members in this organization
        member:you can specify specific members with specific roles
        team:you can specify specific teams with specific roles
        tag:you can specify specific member tags with specific roles,and this will affect all members in the member tags
        `,
        role:"you can manage project roles here,you can assign or revoke permissions with a role",
        issueSolution:"you can change issue solution here,if this project has already issues,you have to specify the relationship between old issue types and new issue types",
        issue:"you can check issues here,issue is a piece of work you should solve",
        board:"board is collection that includes many sprints,you can create different boards for different sprint types",
        issueSolutionProjectCreate:"issue solution is a collection that includes different issue types,it looks like different kind of work",
        release:"release is a version that includes many issues.",
        boardIssueType:"You need to include the types of issue types that need to be processed",
        column:"column is kanban status for issues,you can add,edit or delete the column",
        sprint:"sprint is a short version that includes many issues for agile project",
        kanban:"kanban can show issues' status clearly in the sprint",
        swimLane:"swim lane is a issues' pool that needs to complete a specific task",
        manDay:"the number of days it takes to complete the issue",
        plan:"we can plan the issues,arrange the dependence relationship,and make a gantt chart",
        planItemType:`stage:it's a collection that includes sub stages,issues,and milestones.
        milestone:it shows the completion of issues and stages above in a level.
        `
    },
    notification:{
        teamUserAdd:{
            0:"TEAM:team",
            1:"has added you"
        },
        wikiItemAt:{
            0:"WIKI:you are mentioned in wiki item"
        },
        organizationUserRoleChange:{
            0:"ORGANIZATION:your organization role has been changed in organization "
        },
        organizationUserRemove:{
            0:"ORGANIZATION:you has been removed in organization "
        },
        organizationUserQuit:{
            0:"ORGANIZATION: ",
            1:" quit the organization "
        },
        organizationInvitation:{
            0:"ORGANIZATION:organization ",
            1:" is inviting you"
        },
        issueCommentAt:{
            0:"ISSUE:you are mentioned by",
            1:"in issue"
        },
        teamDismiss:{
            0:"TEAM:team ",
            1:" has been dismissed"
        },
        teamUserRemove:{
            0:"TEAM:you have been removed by",
            1:"in team"
        },
        teamUserRoleChange:{
            0:"TEAM:your team role has been changed in team"
        },
        issueRemove:{
            0:"ISSUE:",
            1:" has been removed by"
        },
        teamUserQuit:{
            0:"TEAM:",
            1:"quit the team"
        },
        issueReporterAssign:{
            0:"ISSUE:",
            1:"assign the reporter of issue",
            2:"to you"
        },
        issueWorkflowChange:{
            0:"ISSUE:the workflow of issue",
            1:"has been changed by"
        },
        issueCommentAdd:{
            0:"ISSUE:",
            1:"add a comment in issue"
        },
        calendarEventInvitation:{
            0:"CALENDAR:you are invited in calendar event"
        },
        issueFieldChange:{
            0:"ISSUE:the field of issue",
            1:"has been changed by"
        },
        issueAssignerAssign:{
            0:"ISSUE:",
            1:"assign the assigner of issue",
            2:"to you"
        },
        issueAssignRelease:{
            0:"ISSUE:the release of issue",
            1:"has been changed by"
        },
        issueAssignSprint:{
            0:"ISSUE:the sprint of issue",
            1:"has been changed by"
        },
        issueApprovalResolve:{
            0:"ISSUE:",
            1:"resolved the approval of issue"
        },
        issueApprovalReject:{
            0:"ISSUE:",
            1:"rejected the approval of issue"
        }
    },
    tip:{
        typePassword:"Type Password",
        emailNotMatch:"email not match",
        archiveSuccess:"Archive Success",
        acceptInvitation:"Do you want accept this invitation?",
        rejectInvitation:"Do you want reject this invitation?",
        deleteCalendar:"Do you want to delete this calendar?",
        deleteEvent:"Do you want to delete this event?",
        deleteFolder:"do you want to delete this folder?",
        deleteItems:"Do you want to delete these items?",
        deleteItem:"Do you want to delete this item?",
        deleteFavorite:"Do you want delete this favorite?",
        deleteMeeting:"Do you want to delete this meeting?",
        leaveMeeting:"Do you leave this meeting?",
        endMeeting:"Do you end this meeting?",
        kick:"Do you want to kick ",
        doYouWant:"Do you want to ",
        promote:"promote ",
        toPresenter:" to presenter",
        demote:"demote ",
        toNormalMember:"to normal member",
        deleteColumn:"Do you want to delete column?",
        removeIssueType:"Do you want to remove this issue type?",
        deleteSwimLane:"Do you want to delete this swim lane?",
        deleteBoard:"Do you want to delete this board?",
        deleteSprint:"Do you want to delete this sprint?",
        startSprint:"Do you want to start this sprint?",
        completeSprint:"Do you want to complete this sprint?",
        removeIssueFromSprint:"Do you want to remove this issue from this sprint?",
        deleteComment:"Do you want to delete this comment?",
        deleteIssue:"Do you want to delete this issue?",
        deleteParentIssue:"Do you want to remove parent issue?",
        deleteChildIssue:"Do you want to remove child issue?",
        deleteRelatedIssue:"Do you want to remove related issue?",
        deleteRelease:"Do you want to delete this release?",
        removeIssue:"Do you want to remove this issue?",
        switchIssueSolution:"Do you want to switch to this issue type solution?",
        deleteRole:"Do you want to delete this role?",
        unbindProjectFromIssueSolution:"Do you want to unbind this project with this issue type solution?",
        deleteField:"Do you want to delete this field?",
        copyIssueSolution:"Do you want to copy this issue type solution?",
        deleteIssueSolution:"Do you want to remove this solution from this organization?",
        copyIssueType:"Do you want to copy this issue type?",
        deleteIssueType:"Do you want to remove this issue type from this issue type solution?",
        doYouWantToDelete:"Do you want to delete ",
        removeUser:"Do you want to remove this user from this organization?",
        deleteProject:"Do you want to delete this project?",
        deleteLabel:"Do you want to remove this label from this project?",
        deleteModule:"Do you want to remove this module?",
        deleteTag:"Do you want to delete this tag?",
        deleteWikiSpace:"Do you want to delete this wiki space?",
        deleteTeam:"Do you want to delete this team?",
        removeMember:"Do you want to remove this member?",
        quitTeam:"Do you want to quit this team?",
        deleteWikiItem:"Do you want to delete this item(the sub items will be appended to current item's parent)?",
        deleteAllWikiItem:"Do you want to delete this item(the sub items will also be deleted)?",
        logout:"Do you want to log out?",
        deleteAlbum:"Do you want to delete this album?",
        deleteNote:"Do you want to delete this sticky note?",
        typeFolderName:"please type folder name",
        typeNewFolderName:"please type new folder name",
        editColumnName:"Edit Column Name",
        newColumnTitle:"New Column Title",
        rejectReason:"Reject Reason",
        typeIssueName:"type the issue's name",
        typeNewIssueSolutionName:"type new issue type solution name",
        typeModuleName:"please input module name",
        editModuleName:"please edit module name",
        typeNewPassword:"type new password",
        typeNewWikiItemName:"type new wiki item name",
        accepted:"Accepted",
        rejected:"Rejected",
        operationSuccess:"operation success",
        updateSuccess:"update success",
        deleteSuccess:"delete success",
        releaseSuccess:"release success",
        unReleaseSuccess:"unRelease success",
        addSuccess:"add success",
        saveSuccess:"save success",
        bindSuccess:"bind success",
        copySuccess:"copy success",
        quitSuccess:"quit success",
        logoutSuccess:"logout success",
        resetSuccess:"reset success",
        favoriteSuccess:"favorite success",
        sendSuccess:"send success",
        registerSuccess:"register success",
        switchToSpecificOrganization:"you should switch to the specific organization",
        passwordNotMatch:"password not match",
        endDateLess:"end date can't less than start date",
        operationFailed:"operation failed",
        cannotShare:"can't share now",
        issueTypeCannotBeEmpty:"issue type can not be empty!",
        selectSprint:"you should select a sprint!",
        notMoveToColumn:"this issue can not move to this column!",
        issueShouldNotBeEmpty:"issue should not be empty",
        contentNotEmpty:"content can not be empty",
        selectBothDate:"you must select both date!",
        notStartNodeNotRemove:"not start node can't be removed !!!",
        typeCode:"type code",
        accept:"Accept",
        reject:"Reject",
        workDay:"WorkDay",
        joinMeetingFailed:"Join Meeting Failed",
        deleteOrganization:"Do you want to delete this organization?",
        notMatch:"input not match",
        quitOrganization:"do you want to quit this organization?",
        switchToOrganization:"you should switch to organization ",
        deletePlan:"Do you want to delete this plan?",
        bindExistedAccount:"Do you want to bind an existed account?",
        leavePage:"Are you sure you want to leave?"
    },
    placeholder:{
        pleaseSelect:"Please Select",
        typeName:"Type Name",
        richText:"type / for command,{'@'} for quote person or drop what you want",
        typeEventName:"Type Event Name",
        newEventTitle:"New Event Title",
        location:"Location",
        typeUserName:"Type User Name",
        typeUsername:"Type Username",
        typeUserOrTeam:"Type User Or Team",
        imMessageSearch:"type your message and at least two characters",
        typeMeetingName:"Type Meeting Name",
        meetingPreview:"if you don't choose,we will pick up default",
        typeProjectName:"Type Project Name",
        typeBoardName:"Type Board Name",
        typeSprintName:"Type Sprint Name",
        typeNameOrUniqueId:"Type Name Or Unique Id",
        typeLabel:"Type Label",
        typeAssigner:"Type Assigner",
        typeReporter:"Type Reporter",
        typeReleaseName:"Type Release Name",
        typeTeamName:"Type Team Name",
        typeWikiName:"Type Wiki Name",
        typeUsernameOrNickname:"Type Username or Nickname",
        typeTitle:"Type Title",
        typeWikiSpaceName:"Type Wiki Space Name",
        typeProjectIssueName:"Type Project Issue Name",
        typeWikiItemName:"Type Wiki Item Name",
        organization:"Organization",
        search:"type whatever you want",
        enterUsername:"Enter Username",
        typePassword:"Type Password",
        typeEmail:"Type Email",
        typePasswordAgain:"Type Password Again",
        typeMeetingPassword:"Type Meeting Password",
        typeOrganizationName:"Type Organization Name",
        typeProjectReleaseName:"Type Project Release Name",
        typeCalendarEventName:"type calendar event name",
        typeMeetingRoomName:"type meeting room name",
        typePlanName:"Type Plan Name",
    },
    "util":{
        "ok":"Ok",
        "cancel":"Cancel",
        save:"Save",
        clear:"Clear",
        all:"All",
        none:"None",
        rename:"Rename",
        refresh:"Refresh",
        remove:"Remove",
        file:"File",
        folder:"Folder",
        shortcut:"Shortcut",
        project:"Project",
        projectIssue:"Project Issue",
        projectRelease:"Project Release",
        wikiProject:"Wiki Project",
        wikiItem:"Wiki Item",
        calendarEvent:"Calendar Event",
        meeting:"Meeting",
        profile:"Profile",
        close:"Close",
        invite:"Invite",
        leave:"Leave",
        end:"End",
        message:"Message",
        issueType:"Issue Type",
        fields:"Fields",
        field:"Field",
        go:"Go",
        create:"Create",
        edit:"Edit",
        delete:"Delete",
        status:"Status",
        start:"Start",
        complete:"Complete",
        issues:"Issues",
        low:"Low",
        medium:"Medium",
        high:"High",
        urgent:"Urgent",
        import:"Import",
        filter:"Filter",
        priority:"Priority",
        label:"Label",
        assigner:"Assigner",
        reporter:"Reporter",
        notStart:"Not Start",
        inProgress:"InProgress",
        done:"Done",
        copy:"Copy",
        convert:"Convert",
        description:"Description",
        startDate:"Start Date",
        releaseDate:"Release Date",
        endDate:"End Date",
        archived:"Archived",
        released:"Released",
        unReleased:"UnReleased",
        action:"Action",
        release:"Release",
        unRelease:"UnRelease",
        archive:"Archive",
        add:"Add",
        manage:"Manage",
        type:"Type",
        home:"Home",
        issue:"Issue",
        board:"Board",
        setting:"Setting",
        yes:"Yes",
        no:"No",
        upload:"Upload",
        bind:"Bind",
        revoke:"Revoke",
        workflow:"Workflow",
        person:"Person",
        team:"Team",
        submit:"Submit",
        search:"Search",
        default:"Default",
        tag:"Tag",
        role:"Role",
        user:"User",
        access:"Access",
        module:"Module",
        member:"Member",
        organization:"Organization",
        global:"Global",
        specific:"Specific",
        wiki:"Wiki",
        issueSolution:"Issue Solution",
        quit:"Quit",
        preview:"Preview",
        calendar:"Calendar",
        finder:"Finder",
        im:"IM",
        people:"People",
        tool:"Tool",
        stickyNote:"Sticky Note",
        album:"Album",
        account:"Account",
        login:"Login",
        logout:"Logout",
        input:"Input",
        alert:"Alert",
        register:"Register",
        reset:"Reset",
        resend:"resend",
        wallpaper:"Wallpaper",
        members:"Members",
        detail:"Detail",
        more:"More",
        basic:"Basic",
        projectBoard:"Project Board",
        projectBoardSprint:"Project Board Sprint",
        wikiSpace:"Wiki Space",
        meetingRoom:"Meeting Room",
        info:"Info",
        participant:"Participant",
        sprint:"Sprint",
        kanban:"Kanban",
        config:"Config",
        comments:"Comments",
        comment:"Comment",
        history:"History",
        avatar:"Avatar",
        username:"Username",
        password:"Password",
        sign:"Sign",
        repeatPassword:"Repeat Password",
        location:"Location",
        timeZone:"TimeZone",
        name:"Name",
        color:"Color",
        size:"Size",
        date:"Date",
        path:"Path",
        category:"Category",
        key:"Key",
        swimLanes:"Swim Lanes",
        swimLane:"Swim Lane",
        wikiCount:"Wiki Count",
        meetingId:"Meeting Id",
        meetingPassword:"Meeting Password",
        users:"Users",
        selectCamera:"Select Camera",
        selectAudio:"Select Audio Input",
        videoOn:"Video On",
        audioOn:"Audio On",
        created:"Created",
        joined:"Joined",
        issueTypes:"Issue Types",
        dateRange:"Date Range",
        fixVersions:"Fix Versions",
        keyword:"Project Id",
        issueKey:"Issue Id",
        logo:"Logo",
        fieldType:"Field Type",
        optional:"Optional",
        labelType:"Label Type",
        options:"Options",
        approval:"Approval",
        allowAllConnections:"Allow All Connections",
        approvalType:"Approval Type",
        chooseMemberTag:"Choose Member Tag",
        permissions:"Permissions",
        tags:"Tags",
        nickname:"Nickname",
        job:"Job",
        email:"Email",
        phone:"Phone",
        department:"Department",
        active:"Active",
        remark:"Remark",
        photo:"Photo",
        creator:"Creator",
        passwordConfirm:"Password Confirm",
        code:"Code",
        online:"Online",
        busy:"Busy",
        operation:"Operation",
        progress:"Progress",
        permission:"Permission",
        reserved:"Reserved",
        enable:"Enable",
        joinDate:"Join Date",
        starting:"Starting",
        completed:"Completed",
        accept:"Accept",
        reject:"Reject",
        workDay:"WorkDay",
        commit:"Commit",
        resolve:"Resolve",
        resetPassword:"Reset Password",
        explore:"Explore",
        system:"System",
        free:"Free",
        notification:"Notification",
        next:"Next",
        previous:"Previous",
        dashboard:"DashBoard",
        editProfile:"Edit Profile",
        accepted:"Accepted",
        rejected:"Rejected",
        issueTypeList:"IssueType List",
        waitForApproval:"Wait For Approval",
        addItem:"Add Item",
        me:"Me",
        newFolder:"New Folder",
        paste:"Paste",
        download:"Download",
        console:"Console",
        skip:"Skip",
        organizationList:"Organization List",
        help:"Help",
        task:"Task",
        bug:"Bug",
        ticket:"Ticket",
        node:"Node",
        transition:"Transition",
        createdBy:"Created By",
        application:"Application",
        todo:"To Do",
        unNamed:"UnNamed",
        manDay:"Man Day",
        plan:"Plan",
        gantt:"Gantt",
        stage:"Stage",
        milestone:"Milestone",
        depend:"Depend",
        delay:"Delay(Day)",
        day:"Day",
        month:"Month",
        sunday:"Sunday",
        monday:"Monday",
        tuesday:"Tuesday",
        wednesday:"Wednesday",
        thursday:"Thursday",
        friday:"Friday",
        saturday:"Saturday"
    },
    "common":{
        "component":{
            field:{
                basic:{
                    fieldEditBasicAssigner:{
                        noUser:"No User"
                    }
                }
            }
        }
    },
    "controller":{
        "app":{
            "account":{
                "account":{
                    "profile":"Profile",
                    "accountSetting":"Account Setting"
                }
            },
            calendar:{
                calendar:{
                    myCalendars:"My Calendars",
                    today:"Today",
                    day:"Day",
                    week:"Week",
                    month:"Month",
                    calendarGlobalSetting:"Calendar Global Setting",
                    followDeviceTimeZone:"Follow Device TimeZone",
                    startWeekDay:"Start Week Day",
                    addCalendar:"Add Calendar",
                    editCalendar:"Edit Calendar",
                    addEvent:"Add Event",
                    editEvent:"Edit Event"
                },
                calendarEventAddSimple:{
                    moreOption:"More Option"
                },
                calendarEventDateEdit:{
                    allDay:"ALL Day",
                    repeat:"Repeat",
                    selectWeekday:"Select Weekday",
                    inputDay:"Input Day"
                },
                calendarEventEdit:{
                    advanced:"Advanced",
                    noReminder:"No Reminder",
                    fiveMinBefore:"5 Min Before",
                    fifteenMinBefore:"15 Min Before",
                    thirtyMinBefore:"30 Min Before",
                    oneHourBefore:"1 Hour Before",
                    sixHourBefore:"6 Hour Before",
                    startMeeting:"Start Meeting",
                    joinMeeting:"Join Meeting",
                },
                calendarEventShortView:{
                    invitedYou:"invited you"
                }
            },
            finder:{
                finder:{
                    searchResult:"SEARCH RESULT"
                },
                finderFolderTree:{
                    addFolder:"Add Folder"
                }
            },
            im:{
                im:{
                    favorites:"Favorites",
                    messages:"Messages",
                    recent:"Recent"
                }
            },
            meeting:{
                meeting:{
                    startMeeting:"Start Meeting",
                    meetingSetting:"Meeting Setting",
                    joinMeeting:"Join Meeting",
                    scheduleMeeting:"Schedule Meeting",
                    meetingList:"Meeting List",
                    editSetting:"Edit Setting",
                    editMeeting:"Edit Meeting"
                },
                meetingProfile:{
                    chat:"chat",
                    meetingPreview:"Meeting Preview"
                },
                meetingOperation:{
                    meetingInfo:"Meeting Info"
                },
                meetingParticipant:{
                    presenter:"Presenter"
                },
                meetingPreview:{
                    tip:"Tip: Meeting functionality needs camera permission,if camera permission prompt pop up,please click allow!",
                    blur:"Background Blur"
                },
                meetingSetting:{
                    personalSetting:"Personal Meeting Setting",
                    backgroundSetting:"Background Setting",
                    backgroundImage:"Background Image"
                }
            },
            people:{
                peopleProfile:{
                    recentTeams:"Recent Teams"
                }
            },
            project:{
                home:{
                    projectHome:{
                        issueTotal:"Issue Total",
                        unResolvedIssueTotal:"UnResolved Issue Total",
                        releaseTotal:"Release Total",
                        sprintTotal:"Sprint Total",
                        statics:"Statics",
                        myRecentIssueList:"My Recent Working Issue List",
                        userIssueList:"Users' Issue Chart",
                        userUnDoneIssueList:"User's UnResolved Issue Chart",
                        recentReleaseList:"Recent Release List"
                    }
                },
                board:{
                    boardConfig:{
                        addColumn:"Add Column",
                        addIssueType:"Add Issue Type"
                    },
                    boardSprintList:{
                        notStart:"Not Start",
                        starting:"Starting",
                        completed:"Completed",
                        swimLanes:"Swim Lanes"
                    },
                    boardKanban:{
                        addSwimLane:"Add Swim Lane",
                        editSwimLane:"Edit Swim Lane",
                        addIssue:"Add Issue",
                        selectAction:"Select Action"
                    }
                },
                issue:{
                    projectIssueConvert:{
                        convertFields:"Convert Fields"
                    },
                    projectIssueHistory:{
                        createdTheIssue:"created th issue",
                        resolvedYourApproval:"resolved your approval",
                        rejectedYourApproval:"rejected your approval",
                        updatedTheField:"updated the field",
                        newValue:"new value",
                        updatedTheWorkflow:"updated the workflow",
                        newWorkflow:"new workflow",
                        convertTheIssue:"convert the issue"
                    },
                    projectIssueList:{
                        remark:"If you wanna open in a new tab,hold command(Mac) or control(Win) Key,click the link below"
                    },
                    projectIssueProfile:{
                        related:"Related",
                        child:"Child",
                        parent:"Parent",
                        quickMeeting:"Quick Meeting",
                        createChildIssue:"Create Child Issue",
                        linkIssue:"Link Issue"
                    },
                    projectIssueRelated:{
                        parentIssue:"Parent Issue",
                        childIssues:"Child Issues",
                        relatedIssues:"Related Issues"
                    },
                    projectIssueCreate:{
                        customFields:"Custom Fields"
                    }
                },
                release:{
                    projectReleaseIfCan:{
                        thereAreStill:"there are still",
                        unresolvedIssues:"unresolved issues",
                        continueToRelease:"Do you Still continue to Release"
                    },
                    projectReleaseList:{
                        noIssues:"No Issues"
                    },
                    projectReleaseProfile:{
                        addIssue:"Add Issue"
                    }
                },
                project:{
                    yourWork:"Your Work",
                    recentProjectList:"Recent Process",
                    allProjectList:"All",
                    myDoneIssue:"My Done Issue",
                    myOpenIssue:"My Open Issue",
                    doneIssue:"Done issue",
                    openIssue:"Open Issue"
                },
                setting:{
                    projectSettingIssueSolution:{
                        issueTypeConvert:"Issue Type Convert"
                    },
                    projectSettingRole:{
                        addRole:"Add Role",
                        editRole:"Edit Role"
                    }
                }
            },
            setting:{
                home:{
                    settingHome:{
                        projectTotal:"Project Total",
                        issueTotal:"Issue Total",
                        wikiSpaceTotal:"Wiki Space Total",
                        wikiItemTotal:"Wiki Item Total",
                        userTotal:"User Total",
                        teamTotal:"Team Total",
                        statics:"Statics",
                        projectWithIssueList:"Projects With Issues Chart",
                        projectWithUnDoneIssueList:"Project With UnResolved Issues Chart",
                        wikiSpaceWithWikiItemList:"Wiki Space Chart",
                        teamWithUserList:"Team Chart"
                    }
                },
                issue:{
                    filedList:{
                        copyFrom:"Copy From"
                    },
                    issueSolutionList:{
                        bindProject:"Bind Project"
                    },
                    workflow:{
                        addNode:"Add Node",
                        editFields:"Edit Fields",
                        choosePerson:"Choose Person",
                        chooseTeam:"Choose Team",
                        chooseWorkflowField:"Choose Workflow Field",
                        border:"the border of node is pink"
                    },
                    fieldCopyFrom:{
                        overwrite:"OverWrite Current Fields"
                    }
                },
                project:{
                    editProjectAccess:{
                        name:"name",
                        memberType:"member type"
                    }
                },
                role:{
                    project:{
                        projectList:{
                            manageRole:"Manage Role"
                        }
                    }
                },
                userTeam:{
                    user:{
                        resetPassword:"Reset Password"
                    },
                    tag:{
                        addTag:"Add Tag",
                        editTag:"Edit Tag"
                    }
                },
                setting:{
                    userManage:"User Manage",
                    teamManage:"Team Manage",
                    tagManage:"Tag Manage",
                    organizationEdit:"Organization Edit",
                    organizationRole:"Organization Role",
                    globalProjectRole:"Global Project Role",
                    projectList:"Project List",
                    teamRole:"Team Role",
                    teamList:"Team List",
                    globalWikiRole:"Global Wiki Role",
                    wikiList:"Wiki Space List"
                }
            },
            wiki:{
                wikiItemContent:{
                    lastModified:"last modified"
                },
                wikiProfile:{
                    workspacePages:"Workspace Pages",
                    deleteIncludeChildren:"Delete(Include Children)"
                },
                wiki:{
                    recentWikiList:"Recent Edit",
                    allWikiList:"All"
                }
            },
            team:{
                team:{
                    managedTeam:"Managed Team",
                    joinedTeam:"Joined Team"
                }
            }
        },
        "desktop":{
            comp:{
                recentIssue:"Recent Issue",
                recentCreatedProject:"Recent Project",
                recentCreatedWikiSpace:"Recent Wiki Space",
                recentCalendarEvent:"Recent Calendar Event",
                recentMeeting:"Recent Meeting"
            },
            desktop:{
                createOrganization:"Create Organization",
                editOrganizationUserProfile:"Edit Organization User Profile"
            },
            missCallShow:{
                invitedYou:"invited you"
            },
            guide:{
                createOrganization:"Create Organization",
                organizationDescription:"Firstly,you should create an organization that represents your company,your group or your firm",
                projectDescription:"you can handle issue,board and release here",
                wikiDescription:"you can read and write wiki here",
                calendarDescription:"you can create calendar event and schedule your work here",
                finderDescription:"you can manage your file and shortcut,upload and download here",
                imDescription:"you can reach out to any person here",
                meetingDescription:"you can create,join or schedule meeting here",
                profileDescription:"you can edit your profile,change background,use sticky note and album here",
                searchDescription:"search whatever you want",
                notificationDescription:"you can retrieve your notifications about project,issue,wiki,calendar and so on",
                doneDescription:"Everything is done! Enjoy your journey!"
            }
        },
        "index":{
            home:{
                docLink:"https://team-linker.com/doc/en/",
                doc:"Manual",
                product:"Product",
                resource:"Resource",
                price:"Price",
                login:"Log In",
                getFree:"Get Free",
                getDockerEdition:"Get Docker Edition",
                section1:{
                    1:"Collaboration is",
                    2:"efficient",
                    3:"simple",
                    4:"and",
                    5:"powerful",
                    6:"Link Every Team Easier And Faster",
                    7:"Teamlinker is a collaboration solution for enterprise customers"
                },
                section2:{
                    1:"HOW IT WORKS",
                    2:"One Platform,One Piece Of Data,",
                    3:"Resolve Basic Online Work Flow",
                    4:"Teamlinker is a place where better work,faster collaboration.All your work in one entry"
                },
                project:{
                    1:"Workflow Freestyle",
                    2:"Kanban & Release Support",
                    3:"Issue Approval",
                    4:"Custom Fields"
                },
                wiki:{
                    1:"Based On Block Editor",
                    2:"Drag & Drop Anything",
                    3:"Realtime Save",
                    4:"Infinite Structure"
                },
                calendar:{
                    1:"AllDay & Recurring Event",
                    2:"Invite Anyone",
                    3:"One-Button Meeting",
                    4:"Switch Timezone"
                },
                meeting:{
                    1:"Invite,Join,Schedule Meeting",
                    2:"Desktop & Screen Share",
                    3:"Presenter Management",
                    4:"Meeting Chat"
                },
                section3:{
                    1:"Collaboration Evolution",
                    2:"Free Offline Deployment,Absolutely Security",
                    3:"Free Online Version Available,Immediately Contact Your Team",
                    4:"docker edition for offline,only one server is needed"
                },
                im:{
                    1:"{'@'} All & People In Team Chat",
                    2:"Team Meeting",
                    3:"Message Search",
                    4:"Favourite Management"
                },
                finder:{
                    1:"File & Folder Drag And Drop",
                    2:"Shortcut for Issue,Event,Meeting...",
                    3:"File Quick Preview",
                    4:"Upload And Download"
                },
                system:{
                    1:"Based On Web Operating System",
                    2:"Multiply Windows And Tasks",
                    3:"Search Everything You Want",
                    4:"Widgets:Sticky Note & Album"
                },
                section4:{
                    1:"They Are Using Teamlinker",
                    2:"TeamLinker has greatly helped me reduce the cost of the team, it is really great!",
                    3:"TeamLinker is a very powerful team collaboration tool that allows me to communicate with team members anytime, anywhere.",
                    4:"I like TeamLinker,i no longer buy any other tools once i use it!"
                },
                section5:{
                    1:"Get Started For Free",
                    2:"Just go ahead! Sign up and create your team.",
                    3:"Sign Up Online",
                    4:"Deploy Offline Edition"
                }
            },
            price:{
                onlineEdition:"Online Edition",
                offlineEdition:"Offline Edition",
                1:"No Usage Limit",
                2:"No Functionality Limit",
                3:"No Member Limit",
                4:"Single File Size Limit",
                5:"No File Size Limit"
            },
            footer:{
                contactUs:"Contact Us",
                company:"Teamlinker Labs,Inc"
            }
        },
        "login":{
            registerCode:{
                receiveCode:"if you don't receive verification code email,you can"
            },
            bindAccount:{
                bindExistedAccount: "Bind Account"
            }
        }
    }
}